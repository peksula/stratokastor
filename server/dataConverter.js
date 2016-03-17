var parser = require('xml2json');
var interpolator = require('./interpolator');
var utils = require('./utils');

exports.createConverter = function (data) {
    function converter(name, converterFunction) {
        this.name = name;
        this.convert = converterFunction;
    }
    
    function route(startTime, device, dataPoints, duration, distance, climb, startLat, startLng, geoPoints) {
        this.startTime = startTime;
        this.device = device;
        this.dataPoints = dataPoints;
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
            percentage: 0
            };
        return point;
    }
    
    var createAuxiliaryDataPoint = function(index, currentPoint, timeStamps, distances, percentages) {
        var point = {
            timeStamp: timeStamps[index],
            altitude: currentPoint.altitude,
            distance: distances[index],
            duration: currentPoint.duration, // todo?
            climb: currentPoint.climb,
            heartRate: currentPoint.heartRate,
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
    
    var createAuxiliaryDataPointsIfNeeded = function(amountOfAuxPointsNeeded, currentPoint, nextPoint, totalDistance, furnished) {
        if (amountOfAuxPointsNeeded > 0) {
            var futurePercentage = utils.percentageRun(nextPoint.distance, totalDistance);
            var percentages = interpolator.interpolateNumber(currentPoint.percentage, futurePercentage, amountOfAuxPointsNeeded);
            var distances = interpolator.interpolateNumber(currentPoint.distance, nextPoint.distance, amountOfAuxPointsNeeded);
            var timeStamps = interpolator.interpolateDate(currentPoint.timeStamp, nextPoint.timeStamp, amountOfAuxPointsNeeded);
                
            for (i = 0; i < amountOfAuxPointsNeeded; i++) { 
                var auxPoint = createAuxiliaryDataPoint(i, currentPoint, timeStamps, distances, percentages);
                furnished.push(auxPoint);
            }
        }
    }
    
    var furnishDataPoints = function (dataPoints, totalDistance) {
        var i = 0;
        var furnished = [];
        
        // Do a second pass sweep over data. Augment missing data.
        dataPoints.forEach(function(dataPoint) {
            dataPoint.percentage = utils.percentageRun(dataPoint.distance, totalDistance);
            furnished.push(dataPoint);
            
            if (i < dataPoints.length - 1) {
                var secondsToNext = utils.secondsToNextPoint(dataPoints[i].timeStamp, dataPoints[i+1].timeStamp);
                createAuxiliaryDataPointsIfNeeded(secondsToNext - 1, dataPoints[i], dataPoints[i+1], totalDistance, furnished);
            }
            i++;
        });
        return furnished;
    }
    
    var tcx2ConverterFn = function(data) {
        var text = parser.toJson(data);
        var json = JSON.parse(text);
        var lastAltitudeReading;
        var totalClimb = 0;
        
        var startTime;
        var dataPoints = [];
        var geoPoints = [];

        json.TrainingCenterDatabase.Activities.Activity.Lap.forEach(function(elem) {
            elem.Track.Trackpoint.forEach(function(trackPoint) {
                
                if (startTime === undefined) {
                    startTime = trackPoint.Time;
                }
                
                totalClimb = calculateClimb(trackPoint, lastAltitudeReading, totalClimb);

                var point = createDataPoint(trackPoint, startTime, totalClimb);
                if (point != null) {
                    dataPoints.push(point);
                    lastAltitudeReading = parseFloat(point.altitude);
                }
                var geoPoint = createGeoPoint(trackPoint);
                if (geoPoint != null) {
                    geoPoints.push(geoPoint);
                }
            });
        });            
        
        var totalDuration = runTime(startTime, dataPoints[dataPoints.length-1].timeStamp);
        var totalDistance = dataPoints[dataPoints.length-1].distance;
        dataPoints = furnishDataPoints(dataPoints, totalDistance);
        
        return new route(
            startTime,
            json.TrainingCenterDatabase.Activities.Activity.Creator.Name,
            dataPoints,
            totalDuration,
            totalDistance,
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
    
    for (i = 0; i < converters.length; i++) {
        var n = data.search(converters[i].pattern);
        if (n > -1) {
            var dataConverter = new converter(converters[i].name, converters[i].converterFunction);
            return dataConverter;
        }
    };

    return undefined;
};