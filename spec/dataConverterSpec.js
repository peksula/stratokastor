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

    it("should return gpxConverter for gpx files", function() {
        var relativePath = 'data/activity_986153810.gpx';
        var buffer = readFileAsString(relativePath);
        expect(converter.createConverter(buffer).name).toBe("gpx");
    });
});

describe("Tcx2Converter", function() {

    it("should convert fitbit tcx data correctly", function() {
        var relativePathFitbitSurge = 'data/993568829.tcx';
        var fitbitBuffer = readFileAsString(relativePathFitbitSurge);
        this.route = converter.createConverter(fitbitBuffer).convert(fitbitBuffer);

        expect(this.route.startTime).toBe("2015-11-30T21:51:29.000+02:00");
        expect(this.route.device).toBe("Fitbit Surge");
        expect(this.route.geoPoints.length).toBe(2502);
        var metaPointCount = this.route.metaPoints.length;
        expect(this.route.metaPoints[metaPointCount-1].distance).toBe("5438.1");
        expect(this.route.geoPoints[2498].lat).toBe(60.18599021434784);
        expect(this.route.geoPoints[2498].lng).toBe(25.05650023619334);
        expect(this.route.startLat).toBe(60.18615917364756);
        expect(this.route.startLng).toBe(25.056412513057392);
        expect(this.route.duration).toBe("41:42"); // 22:33:11 - 21:51:29
    });

    it("should convert garmin tcx data correctly", function() {
        var relativePathGarminForerunner210 = 'data/activity_986153810.tcx';
        var garminBuffer = readFileAsString(relativePathGarminForerunner210);
        this.garminRoute = converter.createConverter(garminBuffer).convert(garminBuffer);

        expect(this.garminRoute.startTime).toBe("2015-12-10T18:03:58.000Z");
        expect(this.garminRoute.device).toBe("Garmin Forerunner 210");
        expect(this.garminRoute.geoPoints.length).toBe(608);
        var garminMetaPointCount = this.garminRoute.metaPoints.length;
        expect(this.garminRoute.metaPoints[garminMetaPointCount-1].distance).toBe("8370.2099609375");
        expect(this.garminRoute.geoPoints[607].lat).toBe(60.991019094362855);
        expect(this.garminRoute.geoPoints[607].lng).toBe(25.475816605612636);
        expect(this.garminRoute.startLat).toBe(60.99109562113881);
        expect(this.garminRoute.startLng).toBe(25.475734379142523);
        expect(this.garminRoute.duration).toBe("52:21"); // 18:56:19 - 18:03:58
    });
    
/*    
    it("should return correct amount of meta points", function() {
        expect(this.route.metaPoints.length).toBe(2502); // 41:42 --> 2502 seconds
        expect(this.garminRoute.metaPoints.length).toBe(3141); // 52:21 --> 3141 seconds
    });

    it("should return correct time stamp", function() {
        expect(this.route.metaPoints[4].timeStamp).toBe("2015-11-30T21:51:43.000+02:00");
        expect(this.garminRoute.metaPoints[4].timeStamp).toBe("2015-12-10T18:04:26.000Z");
    });

    it("should return correct altitude", function() {
        expect(this.route.metaPoints[10].altitude).toBe("8.1");
        expect(this.garminRoute.metaPoints[10].altitude).toBe("148.8000030517578");
    });

    it("should return correct heart rate", function() {
        expect(this.route.metaPoints[2499].heartRate).toBe("137");
        expect(this.garminRoute.metaPoints[607].heartRate).toBe("");
    });

    it("should return correct total duration", function() {
        var relativePath = 'data/1671940524.tcx';
        var buffer = readFileAsString(relativePath);
        var route = converter.createConverter(buffer).convert(buffer);
        expect(route.duration).toBe("60:28"); // 22:56:06 - 21:55:38
    });

    it("should return correct incremental duration", function() {
        expect(this.route.metaPoints[3].duration).toBe("0:13"); // 21:51:29 - 21:51:42
        expect(this.garminRoute.metaPoints[3].duration).toBe("0:14"); // 18:04:12 - 18:03:58
    });
    
    it("should return correct percentage", function() {
        expect(this.route.metaPoints[0].percentage).toBe(0);
        expect(this.route.metaPoints[1].percentage).toBeCloseTo(0.064, 3); // 3.5 / 5438.1 * 100
        expect(this.route.metaPoints[2501].percentage).toBe(100);
        expect(this.garminRoute.metaPoints[0].percentage).toBeCloseTo(0.033, 3); // 2.799999952316284 / 8370.2099609375 * 100
        expect(this.garminRoute.metaPoints[607].percentage).toBe(100);
    });

    it("should calculate correct climb", function() {
        expect(this.route.metaPoints[3].climb).toBe(0);
        expect(this.route.metaPoints[8].climb).toBe(3.9);
        expect(this.garminRoute.metaPoints[0].climb).toBe(0);
        expect(this.garminRoute.metaPoints[33].climb).toBeCloseTo(0.4, 4);
    });    
*/  
});
