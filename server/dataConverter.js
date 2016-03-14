var parser = require('xml2json');

exports.createConverter = function (data) {
    function converter(name, converterFunction) {
        this.name = name;
        this.convert = converterFunction;
    }
    
    function route(startTime, device, trackPoints, duration, distance, climb, startLat, startLng, geoPoints) {
        this.startTime = startTime;
        this.device = device;
        this.trackPoints = trackPoints;
        this.duration = duration;
        this.distance = distance;
        this.climb = climb;
        this.startLat = startLat;
        this.startLng = startLng;
        this.geoPoints = geoPoints;
    }
    
    var runTime = function(startTime, endTime) {
        var startDate = new Date(startTime);
        var endDate = new Date(endTime);
        var diffInMilliseconds = endDate.getTime() - startDate.getTime();
        var minutes = Math.floor(diffInMilliseconds / 60000);
        var seconds = ((diffInMilliseconds % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }
    
    var heartRateAtTrackPoint = function(trackPoint) {
        if (trackPoint.HeartRateBpm === undefined) {
            return "";
        }
        return trackPoint.HeartRateBpm.Value;
    }
    
    var calculateClimb = function(tcxPoint, lastAltitudeReading, totalClimb) {
        if (lastAltitudeReading !== undefined) {
            currentAltitude = parseFloat(tcxPoint.AltitudeMeters);
            
            if (currentAltitude > lastAltitudeReading) {
                totalClimb += currentAltitude - lastAltitudeReading;
            }
            //console.log("Altitude " + currentAltitude + ". Climb " + totalClimb);                        
        }
        return totalClimb;
    }
    
    var createDataPoint = function(tcxPoint, startTime, totalClimb) {
        if (tcxPoint.Position === undefined) {
            // Only create a data point if there is lat/lon information for it available
            return null;
        }

        var point = {
            timeStamp: tcxPoint.Time,
            altitude: tcxPoint.AltitudeMeters,
            distance: tcxPoint.DistanceMeters,
            duration: runTime(startTime, tcxPoint.Time),
            climb: totalClimb,
            heartRate: heartRateAtTrackPoint(tcxPoint),
            lat: parseFloat(tcxPoint.Position.LatitudeDegrees),
            lng: parseFloat(tcxPoint.Position.LongitudeDegrees)
            };
        return point;
    }

    var createGeoPoint = function(tcxPoint) {
        if (tcxPoint.Position === undefined) {
            // Only create a geo point if there is lat/lon information for it available
            return null;
        }

        var geoPoint = {
            lat: parseFloat(tcxPoint.Position.LatitudeDegrees),
            lng: parseFloat(tcxPoint.Position.LongitudeDegrees)
            };
        return geoPoint;
    }
    
    var tcx2ConverterFn = function(data) {
        var text = parser.toJson(data);
        var json = JSON.parse(text);
        var lastAltitudeReading;
        var totalClimb = 0;
        
        var startTime;
        var trackPoints = [];
        var geoPoints = [];

        json.TrainingCenterDatabase.Activities.Activity.Lap.forEach(function(elem) {
            elem.Track.Trackpoint.forEach(function(trackPoint) {
                
                if (startTime === undefined) {
                    startTime = trackPoint.Time;
                }
                
                totalClimb = calculateClimb(trackPoint, lastAltitudeReading, totalClimb);

                var point = createDataPoint(trackPoint, startTime, totalClimb);
                if (point != null) {
                    trackPoints.push(point);
                    lastAltitudeReading = parseFloat(point.altitude);
                }
                var geoPoint = createGeoPoint(trackPoint);
                if (geoPoint != null) {
                    geoPoints.push(geoPoint);
                }
            });
        });            
        
        var totalDuration = runTime(startTime, trackPoints[trackPoints.length-1].timeStamp);
        
        return new route(
            startTime,
            json.TrainingCenterDatabase.Activities.Activity.Creator.Name,
            trackPoints,
            totalDuration,
            trackPoints[trackPoints.length-1].distance,
            totalClimb,
            trackPoints[0].lat,
            trackPoints[0].lng,
            geoPoints
        );
    }   

    var tcx2Converter = new converter("tcx2", tcx2ConverterFn);

    var tcx2Pattern = "TrainingCenterDatabase/v2";
    var n = data.search(tcx2Pattern);
    if (n > -1) {
        return tcx2Converter;
    }
    
    return undefined;
};