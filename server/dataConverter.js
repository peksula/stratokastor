var parser = require('xml2json');

exports.createConverter = function (data) {
    function converter(name, converterFunction) {
        this.name = name;
        this.convert = converterFunction;
    }
    
    function route(startTime, device, trackPoints, duration, distance, startLat, startLng) {
        this.startTime = startTime;
        this.device = device;
        this.trackPoints = trackPoints;
        this.duration = duration;
        this.distance = distance;
        this.startLat = startLat;
        this.startLng = startLng;
    }
    
    var runTime = function(startTime, endTime) {
        var startDate = new Date(startTime);
        var endDate = new Date(endTime);
        var diffInMilliseconds = endDate.getTime() - startDate.getTime();
        var minutes = Math.floor(diffInMilliseconds / 60000);
        var seconds = ((diffInMilliseconds % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }
    
    var tcx2ConverterFn = function (data) {
        var text = parser.toJson(data);
        var json = JSON.parse(text);
        var trackPoints = [];
        
        json.TrainingCenterDatabase.Activities.Activity.Lap.forEach(function(elem) {
            elem.Track.Trackpoint.forEach(function(trackPoint) {
                var point = {
                    timeStamp: trackPoint.Time,
                    altitude: trackPoint.AltitudeMeters,
                    distance: trackPoint.DistanceMeters,
                    duration: "dur.",
                    climb: "climb",
                    heartRate: trackPoint.HeartRateBpm.Value,
                    lat: parseFloat(trackPoint.Position.LatitudeDegrees),
                    lng: parseFloat(trackPoint.Position.LongitudeDegrees)
                    };
                trackPoints.push(point);
            });
        });            
        
        var duration = runTime(trackPoints[0].timeStamp, trackPoints[trackPoints.length-1].timeStamp);
        
        return new route(
            json.TrainingCenterDatabase.Activities.Activity.Lap[0].StartTime,
            json.TrainingCenterDatabase.Activities.Activity.Creator.Name,
            trackPoints,
            duration,
            trackPoints[trackPoints.length-1].distance,
            trackPoints[0].lat,
            trackPoints[0].lng
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