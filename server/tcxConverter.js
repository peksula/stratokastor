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
    
    var startTime = function(laps) {
        for (i=0; i < laps.length; i++) {
            var lap = laps[i];
            for (j=0; j < lap.Track.Trackpoint.length; j++) {
                var trackPoint = lap.Track.Trackpoint[j];
                return trackPoint.Time;
            }
        }
    }

    var endTime = function(dataPoints) {
        return dataPoints[dataPoints.length-1].timeStamp;
    }

    var totalDistance = function(laps) {
        for (i=laps.length; i > 0; i--) {
            var lap = laps[i-1];
            for (j=lap.Track.Trackpoint.length; j > 0; j--) {
                var trackPoint = lap.Track.Trackpoint[j-1];
                if (parseFloat(trackPoint.DistanceMeters) > 0) {
                    return Math.round(trackPoint.DistanceMeters * 100) / 100;
                }
            }
        }
        return 0;
    }

    var createDataPoint = function(tcxPoint, startTime, totalClimb, totalDistance, previousPoint) {
        var point = {
            timeStamp: tcxPoint.Time,
            altitude: tcxPoint.AltitudeMeters,
            distance: tcxPoint.DistanceMeters,
            duration: utils.runTimeAsString(startTime, tcxPoint.Time),
            kmh: 0,
            minkm: 0,
            climb: totalClimb,
            heartRate: heartRateAtTrackPoint(tcxPoint),
            percentage: utils.percentageRun(tcxPoint.DistanceMeters, totalDistance)
        };
        if (previousPoint !== undefined) {
            distanceSinceLastPoint = parseFloat(point.distance) - parseFloat(previousPoint.distance);
            point.kmh = utils.kmh(distanceSinceLastPoint, utils.durationInHours(previousPoint.timeStamp, point.timeStamp));
            point.minkm = utils.minkm(distanceSinceLastPoint, utils.durationInMinutes(previousPoint.timeStamp, point.timeStamp));
        }

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
    var laps = objectToArray(json.TrainingCenterDatabase.Activities.Activity.Lap);

    var dataPoints = [];
    var geoPoints = [];
    var lastAltitudeReading;
    var previousPoint;
    var totalClimb = 0;    
    var totalDistance = totalDistance(laps);
    var startTime = startTime(laps);


    laps.forEach(function(lap) {
        var trackPoints = objectToArray(lap.Track.Trackpoint);
        trackPoints.forEach(function(trackPoint) {
            if (trackPoint.Position !== undefined) {
                
                // Only create data points if there is lat/lon information available
                totalClimb += utils.climbSinceLastPoint(trackPoint.AltitudeMeters, lastAltitudeReading);
                lastAltitudeReading = parseFloat(trackPoint.AltitudeMeters);

                var point = createDataPoint(trackPoint, startTime, totalClimb, totalDistance, previousPoint);
                dataPoints.push(point);
                var geoPoint = createGeoPoint(trackPoint);
                geoPoints.push(geoPoint);
                previousPoint = point;
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
