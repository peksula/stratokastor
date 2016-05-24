var interpolator = require('./interpolator');
var utils = require('./utils');

exports.augment = function (dataPoints) {

    var totalDistance = function(dataPoints) {
        return dataPoints[dataPoints.length-1].distance;
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
    
    var i = 0;
    var total = totalDistance(dataPoints);
    var furnished = [];
    
    dataPoints.forEach(function(dataPoint) {
        dataPoint.percentage = utils.percentageRun(dataPoint.distance, total);
        furnished.push(dataPoint);
        
        if (i < dataPoints.length - 1) {
            var secondsToNext = utils.secondsToNextPoint(dataPoints[i].timeStamp, dataPoints[i+1].timeStamp);
            createAuxiliaryDataPointsIfNeeded(secondsToNext - 1, dataPoints[i], dataPoints[i+1], total, furnished);
        }
        i++;
    });
    
    return furnished;

};
