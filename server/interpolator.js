exports.interpolateNumber = function (startValue, endValue, steps) {
    var result = [];
    var diff = endValue - startValue;
    if (diff > 0) {
        var stepSize = diff / (steps + 1);
        for (i=1; i <= steps; i++) {
            var step = startValue + i*stepSize;
            result.push(step);
        }
    }
    return result;
};

exports.interpolateDate = function (startValue, endValue, steps) {
    var result = [];

    var startDate = new Date(startValue);
    var endDate = new Date(endValue);
    var diffInMilliseconds = endDate.getTime() - startDate.getTime();
    var diffInSeconds = (diffInMilliseconds / 1000) | 0;

    if (diffInSeconds > 0) {
        var stepSize = diffInSeconds / (steps + 1);
        for (i=1; i <= steps; i++) {
            var step = new Date(startValue);
            step.setSeconds(step.getSeconds() + i*stepSize);
            result.push(step.toJSON());
        }
    }
    return result;
};
