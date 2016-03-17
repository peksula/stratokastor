exports.percentageRun = function (currentDistance, totalDistance) {
    totalDistance = parseFloat(totalDistance);
    currentDistance = parseFloat(currentDistance);
    if (totalDistance === 0) {
        return 0;
    }
    var percentage = currentDistance/totalDistance*100;
    percentage = Math.round(percentage * 1000) / 1000;
    return percentage;
};

exports.secondsToNextPoint = function(currentTimeStamp, nextTimeStamp) {
    var startDate = new Date(currentTimeStamp);
    var endDate = new Date(nextTimeStamp);
    var diffInMilliseconds = endDate.getTime() - startDate.getTime();
    var diffInSeconds = diffInMilliseconds / 1000;
    return diffInSeconds | 0; // round down
};
