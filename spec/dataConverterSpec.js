var fs = require('fs');
var path = require('path');
var converter = require('../server/dataConverter');

var readFileAsString = function (relPath) {
    return fs.readFileSync(path.join(__dirname, relPath), { encoding: 'utf8' });
}

describe("DataConverterFactory", function() {
    it("should return undefined for empty data", function() {
        expect(converter.converterFactory("")).toBe(undefined);
    });

    it("should return undefined for non-supported data", function() {
        var relativePath = 'data/invalid.txt';
        var buffer = readFileAsString(relativePath);
        expect(converter.converterFactory(buffer)).toBe(undefined);
    });
    
    it("should return undefined for Training Center XML data", function() {
        var relativePath = 'data/993568829_mockv1.tcx';
        var buffer = readFileAsString(relativePath);
        expect(converter.converterFactory(buffer)).toBe(undefined);
    });
    
    it("should return tcxConverter2 for Training Center XML v2 files", function() {
        var relativePath = 'data/993568829.tcx';
        var buffer = readFileAsString(relativePath);
        expect(converter.converterFactory(buffer).name).toBe("tcx2");
    });
});

describe("Tcx2Converter", function() {
    it("should return correct start time", function() {
        var relativePath = 'data/993568829.tcx';
        var buffer = readFileAsString(relativePath);
        var route = converter.converterFactory(buffer).dataConverter(buffer);
        expect(route.startTime).toBe("2015-11-30T21:51:29.000+02:00");
    });

    it("should return correct device", function() {
        var relativePath = 'data/993568829.tcx';
        var buffer = readFileAsString(relativePath);
        var route = converter.converterFactory(buffer).dataConverter(buffer);
        expect(route.device).toBe("Fitbit Surge");
    });
    
    it("should return correct amount of track points", function() {
        var relativePath = 'data/993568829.tcx';
        var buffer = readFileAsString(relativePath);
        var route = converter.converterFactory(buffer).dataConverter(buffer);
        expect(route.trackPoints.length).toBe(2502);
    });
});

