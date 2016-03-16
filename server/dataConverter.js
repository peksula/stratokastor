var parser = require('xml2json');
var interpolator = require('./interpolator');

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
        totalDistance = parseFloat(totalDistance);
        currentDistance = parseFloat(currentDistance);
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
    
    var createAuxiliaryMetaPoint = function(index, currentMetaPoint, timeStamps, distances, percentages) {
        var point = {
            timeStamp: timeStamps[index],
            altitude: currentMetaPoint.altitude,
            distance: distances[index],
            duration: currentMetaPoint.duration, // todo?
            climb: currentMetaPoint.climb,
            heartRate: currentMetaPoint.heartRate,
            percentage: percentages[index]
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
    
    var gpxConverterFn = function(data) {
        return null;
    }
    
    var createAuxiliaryMetaPointsIfNeeded = function(amountOfAuxPointsNeeded, currentMetaPoint, nextMetaPoint, totalDistance, furnishedMetaPoints) {
        if (amountOfAuxPointsNeeded > 0) {
            var futurePercentage = percentageRun(nextMetaPoint.distance, totalDistance);
            var percentages = interpolator.interpolateNumber(currentMetaPoint.percentage, futurePercentage, amountOfAuxPointsNeeded);
            var distances = interpolator.interpolateNumber(currentMetaPoint.distance, nextMetaPoint.distance, amountOfAuxPointsNeeded);
            var timeStamps = interpolator.interpolateDate(currentMetaPoint.timeStamp, nextMetaPoint.timeStamp, amountOfAuxPointsNeeded);
                
            for (i = 0; i < amountOfAuxPointsNeeded; i++) { 
                var auxPoint = createAuxiliaryMetaPoint(i, currentMetaPoint, timeStamps, distances, percentages);
                furnishedMetaPoints.push(auxPoint);
            }
        }
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
                createAuxiliaryMetaPointsIfNeeded(secondsToNext - 1, metaPoints[i], metaPoints[i+1], totalDistance, furnishedMetaPoints);
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

    var converters = [
        {
            pattern: "TrainingCenterDatabase/v2",
            name: "tcx2",
            converterFunction: tcx2ConverterFn
        }, 
        {
            pattern: "GPX/1/1",
            name: "gpx",
            converterFunction: gpxConverterFn
        }
    ];
    
    for (i=0; i<converters.length; i++) {
        var n = data.search(converters[i].pattern);
        if (n > -1) {
            var dataConverter = new converter(converters[i].name, converters[i].converterFunction);
            return dataConverter;
        }
    };

    return undefined;
};