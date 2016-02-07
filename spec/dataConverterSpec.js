var fs = require('fs');
var path = require('path');
var converter = require('../server/dataConverter');

var readFileAsString = function (relPath) {
    return fs.readFileSync(path.join(__dirname, relPath), { encoding: 'utf8' });
}

describe("DataConverterFactory", function() {
    it("should return undefined for empty data", function() {
        expect(converter.createConverter("")).toBe(undefined);
    });

    it("should return undefined for non-supported data", function() {
        var relativePath = 'data/invalid.txt';
        var buffer = readFileAsString(relativePath);
        expect(converter.createConverter(buffer)).toBe(undefined);
    });
    
    it("should return undefined for Training Center XML data", function() {
        var relativePath = 'data/993568829_mockv1.tcx';
        var buffer = readFileAsString(relativePath);
        expect(converter.createConverter(buffer)).toBe(undefined);
    });
    
    it("should return tcxConverter2 for Training Center XML v2 files", function() {
        var relativePath = 'data/993568829.tcx';
        var buffer = readFileAsString(relativePath);
        expect(converter.createConverter(buffer).name).toBe("tcx2");
    });
});

describe("Tcx2Converter", function() {
    it("should return correct start time", function() {
        var relativePath = 'data/993568829.tcx';
        var buffer = readFileAsString(relativePath);
        var route = converter.createConverter(buffer).convert(buffer);
        expect(route.startTime).toBe("2015-11-30T21:51:29.000+02:00");
    });

    it("should return correct device", function() {
        var relativePath = 'data/993568829.tcx';
        var buffer = readFileAsString(relativePath);
        var route = converter.createConverter(buffer).convert(buffer);
        expect(route.device).toBe("Fitbit Surge");
    });
    
    it("should return correct amount of track points", function() {
        var relativePath = 'data/993568829.tcx';
        var buffer = readFileAsString(relativePath);
        var route = converter.createConverter(buffer).convert(buffer);
        expect(route.trackPoints.length).toBe(2502);
    });
    
    it("should return correct time stamp", function() {
        var relativePath = 'data/993568829.tcx';
        var buffer = readFileAsString(relativePath);
        var route = converter.createConverter(buffer).convert(buffer);
        expect(route.trackPoints[4].timeStamp).toBe("2015-11-30T21:51:43.000+02:00");
    });

    it("should return correct altitude", function() {
        var relativePath = 'data/993568829.tcx';
        var buffer = readFileAsString(relativePath);
        var route = converter.createConverter(buffer).convert(buffer);
        expect(route.trackPoints[10].altitude).toBe("8.1");
    });

    it("should return correct distance", function() {
        var relativePath = 'data/993568829.tcx';
        var buffer = readFileAsString(relativePath);
        var route = converter.createConverter(buffer).convert(buffer);
        expect(route.trackPoints[2501].distance).toBe("5438.1");
    });

    it("should return correct heart rate", function() {
        var relativePath = 'data/993568829.tcx';
        var buffer = readFileAsString(relativePath);
        var route = converter.createConverter(buffer).convert(buffer);
        expect(route.trackPoints[2499].heartRate).toBe("137");
    });

    it("should return correct position", function() {
        var relativePath = 'data/993568829.tcx';
        var buffer = readFileAsString(relativePath);
        var route = converter.createConverter(buffer).convert(buffer);
        expect(route.trackPoints[2498].lat).toBe(60.18599021434784);
        expect(route.trackPoints[2498].lng).toBe(25.05650023619334);
    });
    
});

