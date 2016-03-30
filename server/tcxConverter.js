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
    
    var endTime = function(dataPoints) {
        return dataPoints[dataPoints.length-1].timeStamp;
    }

    var totalDistance = function(dataPoints) {
        return dataPoints[dataPoints.length-1].distance;
    }

    var createDataPoint = function(tcxPoint, startTime, totalClimb) {
        var point = {
            timeStamp: tcxPoint.Time,
            altitude: tcxPoint.AltitudeMeters,
            distance: tcxPoint.DistanceMeters,
            duration: utils.runTimeAsString(startTime, tcxPoint.Time),
            climb: totalClimb,
            heartRate: heartRateAtTrackPoint(tcxPoint),
            percentage: 0 // not calculated here
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
    
    var text = parser.toJson(data);
    var json = JSON.parse(text);
    var lastAltitudeReading;
    var totalClimb = 0;
    
    var startTime;
    var dataPoints = [];
    var geoPoints = [];

    // Idea: possible to loop backwards? Would get total distance easily
    json.TrainingCenterDatabase.Activities.Activity.Lap.forEach(function(elem) {
        elem.Track.Trackpoint.forEach(function(trackPoint) {
            
            if (startTime === undefined) {
                startTime = trackPoint.Time;
            }
            
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
        
        
    var totalDuration = utils.runTimeAsString(startTime, endTime(dataPoints));
    var totalDistance = totalDistance(dataPoints);
    
    return new route(
        startTime,
        json.TrainingCenterDatabase.Activities.Activity.Creator.Name,
        dataPoints,
        totalDuration,
        totalDistance,
        totalClimb,
        geoPoints[0].lat,
        geoPoints[0].lng,
        utils.kmh(totalDistance, utils.durationInHours(startTime, endTime(dataPoints))),
        utils.minkm(totalDistance, utils.durationInMinutes(startTime, endTime(dataPoints))),
        geoPoints
    );
};
