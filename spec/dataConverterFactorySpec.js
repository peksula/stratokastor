var fs = require('fs');
var path = require('path');
var factory = require('../server/dataConverterFactory');

var readFileAsString = function (relPath) {
    return fs.readFileSync(path.join(__dirname, relPath), { encoding: 'utf8' });
}

describe("DataConverterFactory", function() {
    it("should return undefined for empty data", function() {
        expect(factory.createConverter("")).toBe(undefined);
    });

    it("should return undefined for non-supported data", function() {
        var relativePath = 'data/invalid.txt';
        var buffer = readFileAsString(relativePath);
        expect(factory.createConverter(buffer)).toBe(undefined);
    });
    
    it("should return undefined for Training Center XML data", function() {
        var relativePath = 'data/993568829_mockv1.tcx';
        var buffer = readFileAsString(relativePath);
        expect(factory.createConverter(buffer)).toBe(undefined);
    });
    
    it("should return tcxConverter2 for Training Center XML v2 files", function() {
        var relativePath = 'data/993568829.tcx';
        var buffer = readFileAsString(relativePath);
        expect(factory.createConverter(buffer).name).toBe("tcx2");
    });

    it("should return gpxConverter for gpx files", function() {
        var relativePath = 'data/activity_986153810.gpx';
        var buffer = readFileAsString(relativePath);
        expect(factory.createConverter(buffer).name).toBe("gpx");
    });
});