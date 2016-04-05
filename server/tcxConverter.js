var parser = require('xml2json');
var utils = require('./utils');

exports.convert = function (data) {

    function route(startTime, device, dataPoints, duration, distance, climb, startLat, startLng, kmh, minkm, geoPoints) {
        this.startTime = startTime;
        this.device = device;
        this.dataPoints = dataPoints;
        this.duration = duration;
        this.distance = distance;
        this.climb = climb;
        this.startLat = startLat;
        this.startLng = startLng;
        this.kmh = kmh;
        this.minkm = minkm;
        this.geoPoints = geoPoints;
    }
 
    var heartRateAtTrackPoint = function(trackPoint) {
        if (trackPoint.HeartRateBpm === undefined) {
            return "";
        }
        return trackPoint.HeartRateBpm.Value;
    }
    
    var startTime = function(json) {
        for (i=0; i < json.TrainingCenterDatabase.Activities.Activity.Lap.length; i++) {
            var lap = json.TrainingCenterDatabase.Activities.Activity.Lap[i];
            for (j=0; j < lap.Track.Trackpoint.length; j++) {
                var trackPoint = lap.Track.Trackpoint[j];
                return trackPoint.Time;
            }
        }
    }

    var endTime = function(dataPoints) {
        return dataPoints[dataPoints.length-1].timeStamp;
    }

    var totalDistance = function(json) {
        for (i=json.TrainingCenterDatabase.Activities.Activity.Lap.length; i > 0; i--) {
            var lap = json.TrainingCenterDatabase.Activities.Activity.Lap[i-1];
            for (j=lap.Track.Trackpoint.length; j > 0; j--) {
                var trackPoint = lap.Track.Trackpoint[j-1];
                if (parseFloat(trackPoint.DistanceMeters) > 0) {
                    return trackPoint.DistanceMeters;
                }
            }
        }
        return 0;
    }

    var createDataPoint = function(tcxPoint, startTime, totalClimb, totalDistance) {
        var point = {
            timeStamp: tcxPoint.Time,
            altitude: tcxPoint.AltitudeMeters,
            distance: tcxPoint.DistanceMeters,
            duration: utils.runTimeAsString(startTime, tcxPoint.Time),
            climb: totalClimb,
            heartRate: heartRateAtTrackPoint(tcxPoint),
            percentage: utils.percentageRun(tcxPoint.DistanceMeters, totalDistance)
            };
        return point;
    }

    var createGeoPoint = function(tcxPoint) {
        var geoPoint = {
            lat: parseFloat(tcxPoint.Position.LatitudeDegrees),
            lng: parseFloat(tcxPoint.Position.LongitudeDegrees)
            };
        return geoPoint;
    }
    
    var objectToArray = function(object) {
        if (!Array.isArray(object)) {
            var array = [];
            array.push(object);
            return array;
        }
        return object;
    }
    
    var text = parser.toJson(data);
    var json = JSON.parse(text);
    var lastAltitudeReading;
    var totalClimb = 0;    
    var totalDistance = totalDistance(json);
    var startTime = startTime(json);

    var dataPoints = [];
    var geoPoints = [];
    var laps = objectToArray(json.TrainingCenterDatabase.Activities.Activity.Lap);
    laps.forEach(function(lap) {
        var trackPoints = objectToArray(lap.Track.Trackpoint);
        trackPoints.forEach(function(trackPoint) {
            if (trackPoint.Position !== undefined) {
                
                // Only create data points if there is lat/lon information available
                totalClimb += utils.climbSinceLastPoint(trackPoint.AltitudeMeters, lastAltitudeReading);
                lastAltitudeReading = parseFloat(trackPoint.AltitudeMeters);

                var point = createDataPoint(trackPoint, startTime, totalClimb, totalDistance);
                dataPoints.push(point);
                var geoPoint = createGeoPoint(trackPoint);
                geoPoints.push(geoPoint);
            }
        });
    });            
        
        
    var endTime = endTime(dataPoints);

    return new route(
        startTime,
        json.TrainingCenterDatabase.Activities.Activity.Creator.Name,
        dataPoints,
        utils.runTimeAsString(startTime, endTime),
        totalDistance,
        totalClimb,
        geoPoints[0].lat,
        geoPoints[0].lng,
        utils.kmh(totalDistance, utils.durationInHours(startTime, endTime)),
        utils.minkm(totalDistance, utils.durationInMinutes(startTime, endTime)),
        geoPoints
    );
};
