
exports.converterFactory = function (data) {
    function converter(name, converterFunction) {
        this.name = name;
        this.converterFunction = converterFunction;
    }
    
    var tcx2Converter = new converter("tcx2", tcx2ConverterFn);
    
    var tcx2ConverterFn = function (data) {
            return "";
        }

    var tcx2Pattern = "TrainingCenterDatabase/v2";
    var n = data.search(tcx2Pattern);
    if (n > -1) {
        return tcx2Converter;
    }
    
    return undefined;
};

