exports.percentageRun = function (currentDistance, totalDistance) {
    totalDistance = parseFloat(totalDistance);
    if (totalDistance === 0) {
        return 0;
    }
    currentDistance = parseFloat(currentDistance);
    var percentage = currentDistance/totalDistance*100;
    return Math.round(percentage * 1000) / 1000;
};

exports.secondsToNextPoint = function(currentTimeStamp, nextTimeStamp) {
    var startDate = new Date(currentTimeStamp);
    var endDate = new Date(nextTimeStamp);
    var diffInMilliseconds = endDate.getTime() - startDate.getTime();
    var diffInSeconds = diffInMilliseconds / 1000;
    return diffInSeconds | 0; // round down
};

exports.climbSinceLastPoint = function(currentAltitude, previousAltitude) {
    // Returns climb since last point. If there is descent instead of climb, returns zero.
    if (previousAltitude !== undefined) {
        previousAltitude = parseFloat(previousAltitude);
        currentAltitude = parseFloat(currentAltitude);
        if (currentAltitude > previousAltitude) {
            var climb = currentAltitude - previousAltitude;
            return Math.round(climb * 1000) / 1000;
        }
    }
    return 0;
};

exports.runTimeAsString = function(startTime, endTime) {
    var startDate = new Date(startTime);
    var endDate = new Date(endTime);
    var diffInMilliseconds = endDate.getTime() - startDate.getTime();
    var minutes = Math.floor(diffInMilliseconds / 60000);
    var seconds = ((diffInMilliseconds % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
};
    
exports.durationInMinutes = function(startTime, endTime) {
    var startDate = new Date(startTime);
    var endDate = new Date(endTime);
    var diffInMilliseconds = endDate.getTime() - startDate.getTime();
    var diffInMins = diffInMilliseconds / 60000;
    return Math.round(diffInMins * 1000) / 1000;
};

exports.durationInHours = function(startTime, endTime) {
    var startDate = new Date(startTime);
    var endDate = new Date(endTime);
    var diffInMilliseconds = endDate.getTime() - startDate.getTime();
    var diffInHours = diffInMilliseconds / 3600000;
    return Math.round(diffInHours * 1000) / 1000;
};

exports.kmh = function(distanceInMeters, runtimeInHours) {
    runtimeInHours = parseFloat(runtimeInHours);
    if (runtimeInHours === 0) {
        return 0;
    }
    var distanceInKm = parseFloat(distanceInMeters)/1000;
    var kmh = distanceInKm / runtimeInHours;
    return Math.round(kmh * 10) / 10;
};