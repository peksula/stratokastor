var parser = require('xml2json');

exports.converterFactory = function (data) {
    function converter(name, converterFunction) {
        this.name = name;
        this.dataConverter = converterFunction;
    }
    
    function route(startTime, device, trackPoints) {
        this.startTime = startTime;
        this.device = device;
        this.trackPoints = trackPoints;
    }
    
    var tcx2ConverterFn = function (data) {
        var text = parser.toJson(data);
        var json = JSON.parse(text);
        //console.log(JSON.stringify(json));
        var trackPoints = [];
        
        json.TrainingCenterDatabase.Activities.Activity.Lap.forEach(function(elem) {
            elem.Track.Trackpoint.forEach(function(trackPoint) {
                var point = {
                    timeStamp: trackPoint.Time,
                    altitude: trackPoint.AltitudeMeters,
                    distance: trackPoint.DistanceMeters,
                    heartRate: trackPoint.HeartRateBpm.Value,
                    lat: trackPoint.Position.LatitudeDegrees,
                    lng: trackPoint.Position.LongitudeDegrees
                    };
                trackPoints.push(point);
            });
        });            
        
        return new route(
            json.TrainingCenterDatabase.Activities.Activity.Lap[0].StartTime,
            json.TrainingCenterDatabase.Activities.Activity.Creator.Name,
            trackPoints
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