var tcxConverter = require('./tcxConverter');

exports.createConverter = function (data) {

    function converter(name, converterFunction) {
        this.name = name;
        this.convert = converterFunction;
    }

    var converters = [
        {
            pattern: "TrainingCenterDatabase/v2",
            name: "tcx2",
            converterFunction: tcxConverter.convert
        }, 
        {
            pattern: "GPX/1/1",
            name: "gpx",
            converterFunction: undefined // not supported at the moment
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