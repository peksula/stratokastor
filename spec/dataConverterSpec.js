describe("DataConverterFactory", function() {
    var converter = require('../public/dataConverter');
    var fs = require('fs');
    var path = require('path');
    
    var readFileAsString = function (relPath) {
        return fs.readFileSync(path.join(__dirname, relPath), { encoding: 'utf8' });
    }

    it("should return undefined for empty data", function() {
        expect(converter.converterFactory("")).toBe(undefined);
    });

    it("should return undefined for non-supported data", function() {
        var relativePath = 'data/invalid.txt';
        var buffer = readFileAsString(relativePath);
        expect(converter.converterFactory(buffer)).toBe(undefined);
    });
    
    it("should return tcxConverter2 for Training Center XML v2 files", function() {
        var relativePath = 'data/993568829.tcx';
        var buffer = readFileAsString(relativePath);
        expect(converter.converterFactory(buffer).name).toBe("tcx2");
    });

  
});
