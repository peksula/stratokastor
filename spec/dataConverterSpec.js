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
    
    beforeEach(function() {
        var relativePathFitbitSurge = 'data/993568829.tcx';
        var fitbitBuffer = readFileAsString(relativePathFitbitSurge);
        this.route = converter.createConverter(fitbitBuffer).convert(fitbitBuffer);

        var relativePathGarminForerunner210 = 'data/activity_986153810.tcx';
        var garminBuffer = readFileAsString(relativePathGarminForerunner210);
        this.garminRoute = converter.createConverter(garminBuffer).convert(garminBuffer);
    });    

    it("should return correct start time", function() {
        expect(this.route.startTime).toBe("2015-11-30T21:51:29.000+02:00");
        expect(this.garminRoute.startTime).toBe("2015-12-10T18:03:58.000Z");
    });

    it("should return correct device", function() {
        expect(this.route.device).toBe("Fitbit Surge");
        expect(this.garminRoute.device).toBe("Garmin Forerunner 210");
    });
    
    it("should return correct amount of track points", function() {
        expect(this.route.trackPoints.length).toBe(2502);
        expect(this.garminRoute.trackPoints.length).toBe(608);
    });
    
    it("should return correct time stamp", function() {
        expect(this.route.trackPoints[4].timeStamp).toBe("2015-11-30T21:51:43.000+02:00");
        expect(this.garminRoute.trackPoints[4].timeStamp).toBe("2015-12-10T18:04:26.000Z");
    });

    it("should return correct altitude", function() {
        expect(this.route.trackPoints[10].altitude).toBe("8.1");
        expect(this.garminRoute.trackPoints[10].altitude).toBe("148.8000030517578");
    });

    it("should return correct distance", function() {
        expect(this.route.trackPoints[2501].distance).toBe("5438.1");
        expect(this.garminRoute.trackPoints[607].distance).toBe("8370.2099609375");
    });

    it("should return correct heart rate", function() {
        expect(this.route.trackPoints[2499].heartRate).toBe("137");
        expect(this.garminRoute.trackPoints[607].heartRate).toBe("");
    });

    it("should return correct position", function() {
        expect(this.route.trackPoints[2498].lat).toBe(60.18599021434784);
        expect(this.route.trackPoints[2498].lng).toBe(25.05650023619334);
        expect(this.garminRoute.trackPoints[607].lat).toBe(60.991019094362855);
        expect(this.garminRoute.trackPoints[607].lng).toBe(25.475816605612636);
    });
    
    it("should return correct starting position", function() {
        expect(this.route.startLat).toBe(60.18615917364756);
        expect(this.route.startLng).toBe(25.056412513057392);
        expect(this.garminRoute.startLat).toBe(60.99109562113881);
        expect(this.garminRoute.startLng).toBe(25.475734379142523);
    });

    it("should return correct total duration", function() {
        expect(this.route.duration).toBe("41:42"); // 22:33:11 - 21:51:29
        expect(this.garminRoute.duration).toBe("52:21"); // 18:56:19 - 18:03:58

        var relativePath = 'data/1671940524.tcx';
        var buffer = readFileAsString(relativePath);
        var route = converter.createConverter(buffer).convert(buffer);
        expect(route.duration).toBe("60:28"); // 22:56:06 - 21:55:38
    });

    it("should return correct incremental duration", function() {
        expect(this.route.trackPoints[3].duration).toBe("0:13"); // 21:51:29 - 21:51:42
    });
    
    it("should return correct distance", function() {
        expect(this.route.distance).toBe("5438.1");
        expect(this.garminRoute.distance).toBe("8370.2099609375");
    });
    
    it("should calculate correct climb", function() {
        expect(this.route.trackPoints[3].climb).toBe(0);
        expect(this.route.trackPoints[8].climb).toBe(3.9);
        expect(this.garminRoute.trackPoints[3].climb).toBe(0);
        expect(this.garminRoute.trackPoints[34].climb).toBe(0.4000091552735);
    });    
    
});
