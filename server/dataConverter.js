var parser = require('xml2json');

exports.createConverter = function (data) {
    function converter(name, converterFunction) {
        this.name = name;
        this.convert = converterFunction;
    }
    
    function route(startTime, device, metaPoints, duration, distance, climb, startLat, startLng, geoPoints) {
        this.startTime = startTime;
        this.device = device;
        this.metaPoints = metaPoints;
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
    
    var percentageRun = function (currentDistance, totalDistance) {
        if (totalDistance === 0) {
            return 0;
        }
        var percentage = currentDistance/totalDistance*100;
        return percentage;
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
    
    var secondsToNextPoint = function(currentTimeStamp, nextTimeStamp) {
        var startDate = new Date(currentTimeStamp);
        var endDate = new Date(nextTimeStamp);
        var diffInMilliseconds = endDate.getTime() - startDate.getTime();
        var diffInSeconds = diffInMilliseconds / 1000;
        return diffInSeconds | 0; // round down
    }
    
    var createMetaPoint = function(tcxPoint, startTime, totalClimb) {
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
            percentage: 0
            };
        return point;
    }
    
    var createAuxiliaryMetaPoint = function(index, steps, currentMetaPoint, nextMetaPoint, totalDistance) {
        
        var basePercentage = currentMetaPoint.percentage;
        var futurePercentage = percentageRun(nextMetaPoint.distance, totalDistance);
        var auxPercentageAddition = (futurePercentage - basePercentage) / steps * index;
        //console.log("base % " + basePercentage);
        //console.log("target % " + futurePercentage);
        
        var auxDate = new Date(currentMetaPoint.timeStamp);
        auxDate.setSeconds(auxDate.getSeconds() + index);
        
        var point = {
            timeStamp: auxDate.toString(),
            altitude: currentMetaPoint.altitude,
            distance: currentMetaPoint.distance, // todo
            duration: currentMetaPoint.duration, // todo?
            climb: currentMetaPoint.climb,
            heartRate: currentMetaPoint.heartRate,
            percentage: basePercentage + auxPercentageAddition
            };
        //console.log("aux % " + point.percentage);
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
    
    var gpxConverterFn = function(data) {
        return null;
    }
    
    var furnishMetaPoints = function (metaPoints, totalDistance) {
        var i = 0;
        var metaPointCount = metaPoints.length;
        var furnishedMetaPoints = [];
        
        // Do a second pass sweep over meta data. Augment missing data.
        metaPoints.forEach(function(metaPoint) {
            metaPoint.percentage = percentageRun(metaPoint.distance, totalDistance);
            furnishedMetaPoints.push(metaPoint);
            
            if (i < metaPointCount-1) {
                var secondsToNext = secondsToNextPoint(metaPoints[i].timeStamp, metaPoints[i+1].timeStamp);
                var amountOfAuxPointsNeeded = secondsToNext - 1;
                for (j = 0; j < amountOfAuxPointsNeeded; j++) { 
                    var auxPoint = createAuxiliaryMetaPoint(j+1, amountOfAuxPointsNeeded, metaPoints[i], metaPoints[i+1], totalDistance);
                    furnishedMetaPoints.push(auxPoint);
                }
            }
            i++;
        });
        return furnishedMetaPoints;
    }
    
    var tcx2ConverterFn = function(data) {
        var text = parser.toJson(data);
        var json = JSON.parse(text);
        var lastAltitudeReading;
        var totalClimb = 0;
        
        var startTime;
        var metaPoints = [];
        var geoPoints = [];

        json.TrainingCenterDatabase.Activities.Activity.Lap.forEach(function(elem) {
            elem.Track.Trackpoint.forEach(function(trackPoint) {
                
                if (startTime === undefined) {
                    startTime = trackPoint.Time;
                }
                
                totalClimb = calculateClimb(trackPoint, lastAltitudeReading, totalClimb);

                var point = createMetaPoint(trackPoint, startTime, totalClimb);
                if (point != null) {
                    metaPoints.push(point);
                    lastAltitudeReading = parseFloat(point.altitude);
                }
                var geoPoint = createGeoPoint(trackPoint);
                if (geoPoint != null) {
                    geoPoints.push(geoPoint);
                }
            });
        });            
        
        var totalDuration = runTime(startTime, metaPoints[metaPoints.length-1].timeStamp);
        var totalDistance = metaPoints[metaPoints.length-1].distance;
        metaPoints = furnishMetaPoints(metaPoints, totalDistance);
        
        return new route(
            startTime,
            json.TrainingCenterDatabase.Activities.Activity.Creator.Name,
            metaPoints,
            totalDuration,
            metaPoints[metaPoints.length-1].distance,
            totalClimb,
            geoPoints[0].lat,
            geoPoints[0].lng,
            geoPoints
        );
    }   

    
    // TODO: refactor below
    var tcx2Converter = new converter("tcx2", tcx2ConverterFn);
    var gpxConverter = new converter("gpx", gpxConverterFn);

    var tcx2Pattern = "TrainingCenterDatabase/v2";
    var gpxPattern = "GPX/1/1";
    
    var isMatch = function(data, pattern) {
        var n = data.search(pattern);
        if (n > -1) {
            return true;
        }
        return false;
    }
    
    if (isMatch(data, tcx2Pattern)) {
        return tcx2Converter;
    }
    if (isMatch(data, gpxPattern)) {
        return gpxConverter;
    }
    
    return undefined;
};