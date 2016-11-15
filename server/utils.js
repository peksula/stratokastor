var diffInMilliseconds = function(startTime, endTime) {
    var startDate = new Date(startTime)
    var endDate = new Date(endTime)
    return endDate.getTime() - startDate.getTime()
}

exports.percentageRun = function (currentDistance, totalDistance) {
    totalDistance = parseFloat(totalDistance)
    if (totalDistance === 0) {
        return 0
    }
    currentDistance = parseFloat(currentDistance)
    var percentage = currentDistance/totalDistance*100
    return Math.round(percentage * 1000) / 1000
}

exports.secondsToNextPoint = function(currentTimeStamp, nextTimeStamp) {
    var diffInSeconds = diffInMilliseconds(currentTimeStamp, nextTimeStamp) / 1000
    return diffInSeconds | 0 // round down
}

exports.climbSinceLastPoint = function(currentAltitude, previousAltitude) {
    // Returns climb since last point. If there is descent instead of climb, returns zero.
    if (previousAltitude !== undefined) {
        previousAltitude = parseFloat(previousAltitude)
        currentAltitude = parseFloat(currentAltitude)
        if (currentAltitude > previousAltitude) {
            var climb = currentAltitude - previousAltitude
            return Math.round(climb * 1000) / 1000
        }
    }
    return 0
}

exports.runTimeAsString = function(startTime, endTime) {
    var diffInMs = diffInMilliseconds(startTime, endTime)
    var minutes = Math.floor(diffInMs / 60000)
    var seconds = ((diffInMs % 60000) / 1000).toFixed(0)
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds
}

exports.durationInMinutes = function(startTime, endTime) {
    var diffInMins = diffInMilliseconds(startTime, endTime) / 60000
    return Math.round(diffInMins * 100000) / 100000
}

exports.durationInHours = function(startTime, endTime) {
    var diffInHours = diffInMilliseconds(startTime, endTime) / 3600000
    return Math.round(diffInHours * 100000) / 100000
}

exports.kmh = function(distanceInMeters, runtimeInHours) {
    runtimeInHours = parseFloat(runtimeInHours)
    if (runtimeInHours === 0) {
        return 0
    }
    var distanceInKm = parseFloat(distanceInMeters)/1000
    var kmh = distanceInKm / runtimeInHours
    return Math.round(kmh * 10) / 10
}

exports.minkm = function(distanceInMeters, runtimeInMinutes) {
    if (distanceInMeters === 0) {
        return 0
    }
    runtimeInMinutes = parseFloat(runtimeInMinutes)
    var distanceInKm = parseFloat(distanceInMeters)/1000
    var minkm = runtimeInMinutes / distanceInKm
    return Math.round(minkm * 10) / 10
}