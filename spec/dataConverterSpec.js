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
        var route = converter.createConverter(fitbitBuffer).convert(fitbitBuffer);

        expect(route.startTime).toBe("2015-11-30T21:51:29.000+02:00");
        expect(route.device).toBe("Fitbit Surge");
        expect(route.geoPoints.length).toBe(2502);
        var metaPointCount = route.dataPoints.length;
        expect(route.dataPoints[metaPointCount-1].distance).toBe("5438.1");
        expect(route.geoPoints[2498].lat).toBe(60.18599021434784);
        expect(route.geoPoints[2498].lng).toBe(25.05650023619334);
        expect(route.startLat).toBe(60.18615917364756);
        expect(route.startLng).toBe(25.056412513057392);
        expect(route.duration).toBe("41:42"); // 22:33:11 - 21:51:29
        
        for (i=1; i < metaPointCount; i++) {
            expect(route.dataPoints[i].percentage).not.toBeLessThan(route.dataPoints[i-1].percentage);
            expect(route.dataPoints[i].duration).not.toBe("");
            expect(route.dataPoints[i].distance).not.toBe("");
            expect(route.dataPoints[i].altitude).not.toBe("");
            expect(route.dataPoints[i].heartRate).not.toBe("");
            var currentDate = new Date(route.dataPoints[i].timeStamp);
            var previousDate = new Date(route.dataPoints[i-1].timeStamp);
            expect(currentDate).not.toBeLessThan(previousDate);
            expect(currentDate.getTime() - previousDate.getTime()).toBeLessThan(1001); // points are maximum one second apart
        }
        
    });

    it("should convert garmin tcx data correctly", function() {
        var relativePathGarminForerunner210 = 'data/activity_986153810.tcx';
        var garminBuffer = readFileAsString(relativePathGarminForerunner210);
        garminRoute = converter.createConverter(garminBuffer).convert(garminBuffer);

        expect(garminRoute.startTime).toBe("2015-12-10T18:03:58.000Z");
        expect(garminRoute.device).toBe("Garmin Forerunner 210");
        expect(garminRoute.geoPoints.length).toBe(608);
        var garminMetaPointCount = garminRoute.dataPoints.length;
        expect(garminRoute.dataPoints[garminMetaPointCount-1].distance).toBe("8370.2099609375");
        expect(garminRoute.geoPoints[607].lat).toBe(60.991019094362855);
        expect(garminRoute.geoPoints[607].lng).toBe(25.475816605612636);
        expect(garminRoute.startLat).toBe(60.99109562113881);
        expect(garminRoute.startLng).toBe(25.475734379142523);
        expect(garminRoute.duration).toBe("52:21"); // 18:56:19 - 18:03:58

        for (i=1; i < garminMetaPointCount; i++) {
            expect(garminRoute.dataPoints[i].percentage).not.toBeLessThan(garminRoute.dataPoints[i-1].percentage);
            expect(garminRoute.dataPoints[i].duration).not.toBe("");
            expect(garminRoute.dataPoints[i].distance).not.toBe("");
            expect(garminRoute.dataPoints[i].altitude).not.toBe("");
            expect(garminRoute.dataPoints[i].heartRate).toBe("");
            var currentDate = new Date(garminRoute.dataPoints[i].timeStamp);
            var previousDate = new Date(garminRoute.dataPoints[i-1].timeStamp);
            expect(currentDate).not.toBeLessThan(previousDate);
            expect(currentDate.getTime() - previousDate.getTime()).toBeLessThan(1001); // points are maximum one second apart
        }
    });
    
/*    
    it("should return correct amount of data points", function() {
        expect(this.route.dataPoints.length).toBe(2502); // 41:42 --> 2502 seconds
        expect(this.garminRoute.dataPoints.length).toBe(3141); // 52:21 --> 3141 seconds
    });

    it("should return correct time stamp", function() {
        expect(this.route.dataPoints[4].timeStamp).toBe("2015-11-30T21:51:43.000+02:00");
        expect(this.garminRoute.dataPoints[4].timeStamp).toBe("2015-12-10T18:04:26.000Z");
    });

    it("should return correct altitude", function() {
        expect(this.route.dataPoints[10].altitude).toBe("8.1");
        expect(this.garminRoute.dataPoints[10].altitude).toBe("148.8000030517578");
    });

    it("should return correct heart rate", function() {
        expect(this.route.dataPoints[2499].heartRate).toBe("137");
        expect(this.garminRoute.dataPoints[607].heartRate).toBe("");
    });

    it("should return correct total duration", function() {
        var relativePath = 'data/1671940524.tcx';
        var buffer = readFileAsString(relativePath);
        var route = converter.createConverter(buffer).convert(buffer);
        expect(route.duration).toBe("60:28"); // 22:56:06 - 21:55:38
    });

    it("should return correct incremental duration", function() {
        expect(this.route.dataPoints[3].duration).toBe("0:13"); // 21:51:29 - 21:51:42
        expect(this.garminRoute.dataPoints[3].duration).toBe("0:14"); // 18:04:12 - 18:03:58
    });
    
    it("should return correct percentage", function() {
        expect(this.route.dataPoints[0].percentage).toBe(0);
        expect(this.route.dataPoints[1].percentage).toBeCloseTo(0.064, 3); // 3.5 / 5438.1 * 100
        expect(this.route.dataPoints[2501].percentage).toBe(100);
        expect(this.garminRoute.dataPoints[0].percentage).toBeCloseTo(0.033, 3); // 2.799999952316284 / 8370.2099609375 * 100
        expect(this.garminRoute.dataPoints[607].percentage).toBe(100);
    });

    it("should calculate correct climb", function() {
        expect(this.route.dataPoints[3].climb).toBe(0);
        expect(this.route.dataPoints[8].climb).toBe(3.9);
        expect(this.garminRoute.dataPoints[0].climb).toBe(0);
        expect(this.garminRoute.dataPoints[33].climb).toBeCloseTo(0.4, 4);
    });    
*/  
});
