var fs = require('fs');
var path = require('path');
var converter = require('../server/tcxConverter');

var readFileAsString = function (relPath) {
    return fs.readFileSync(path.join(__dirname, relPath), { encoding: 'utf8' });
}

describe("Tcx2Converter", function() {
    it("should convert fitbit tcx data correctly", function() {
        var relativePathFitbitSurge = 'data/993568829.tcx';
        var fitbitBuffer = readFileAsString(relativePathFitbitSurge);
        var route = converter.convert(fitbitBuffer);

        expect(route.startTime).toBe("2015-11-30T21:51:29.000+02:00");
        expect(route.device).toBe("Fitbit Surge");
        expect(route.dataPoints.length).toBe(2502);
        expect(route.geoPoints.length).toBe(2502);
        var dataPointCount = route.dataPoints.length;
        expect(route.distance).toBe(5438.1);
        expect(route.geoPoints[2498].lat).toBe(60.18599021434784);
        expect(route.geoPoints[2498].lng).toBe(25.05650023619334);
        expect(route.startLat).toBe(60.18615917364756);
        expect(route.startLng).toBe(25.056412513057392);
        expect(route.duration).toBe("41:42"); // 22:33:11 - 21:51:29
        expect(route.kmh).toBe(7.8);
        expect(route.minkm).toBe(7.7);
        expect(route.dataPoints[4].timeStamp).toBe("2015-11-30T21:51:43.000+02:00");
        expect(route.dataPoints[10].altitude).toBe("8.1");
        expect(route.dataPoints[2499].heartRate).toBe("137");
        expect(route.dataPoints[3].duration).toBe("0:13"); // 21:51:29 - 21:51:42
        expect(route.dataPoints[0].percentage).toBe(0);
        expect(route.dataPoints[1].percentage).toBeCloseTo(0.064, 3); // 3.5 / 5438.1 * 100
        expect(route.dataPoints[2501].percentage).toBe(100);
        
        for (i=1; i < dataPointCount; i++) {
            expect(route.dataPoints[i].percentage).not.toBeLessThan(route.dataPoints[i-1].percentage);
            expect(route.dataPoints[i].duration).not.toBe("");
            expect(route.dataPoints[i].distance).not.toBe("");
            expect(route.dataPoints[i].altitude).not.toBe("");
            expect(route.dataPoints[i].heartRate).not.toBe("");
            var currentDate = new Date(route.dataPoints[i].timeStamp);
            var previousDate = new Date(route.dataPoints[i-1].timeStamp);
            expect(currentDate).not.toBeLessThan(previousDate);
        }        
    });

    it("should convert garmin tcx data correctly", function() {
        var relativePathGarminForerunner210 = 'data/activity_986153810.tcx';
        var garminBuffer = readFileAsString(relativePathGarminForerunner210);
        route = converter.convert(garminBuffer);

        expect(route.startTime).toBe("2015-12-10T18:03:58.000Z");
        expect(route.device).toBe("Garmin Forerunner 210");
        expect(route.dataPoints.length).toBe(608);
        expect(route.geoPoints.length).toBe(608);
        var dataPointCount = route.dataPoints.length;
        expect(route.distance).toBe(8370.21);
        expect(route.geoPoints[607].lat).toBe(60.991019094362855);
        expect(route.geoPoints[607].lng).toBe(25.475816605612636);
        expect(route.startLat).toBe(60.99109562113881);
        expect(route.startLng).toBe(25.475734379142523);
        expect(route.duration).toBe("52:21"); // 18:56:19 - 18:03:58
        expect(route.kmh).toBe(9.6);
        expect(route.minkm).toBe(6.3);
        expect(route.dataPoints[4].timeStamp).toBe("2015-12-10T18:04:26.000Z");
        expect(route.dataPoints[10].altitude).toBe("148.8000030517578");
        expect(route.dataPoints[607].heartRate).toBe("");
        expect(route.dataPoints[3].duration).toBe("0:14"); // 18:04:12 - 18:03:58        
        expect(route.dataPoints[0].percentage).toBeCloseTo(0.033, 3); // 2.799999952316284 / 8370.2099609375 * 100
        expect(route.dataPoints[607].percentage).toBe(100);

        for (i=1; i < dataPointCount; i++) {
            expect(route.dataPoints[i].percentage).not.toBeLessThan(route.dataPoints[i-1].percentage);
            expect(route.dataPoints[i].duration).not.toBe("");
            expect(route.dataPoints[i].distance).not.toBe("");
            expect(route.dataPoints[i].altitude).not.toBe("");
            expect(route.dataPoints[i].heartRate).toBe("");
            var currentDate = new Date(route.dataPoints[i].timeStamp);
            var previousDate = new Date(route.dataPoints[i-1].timeStamp);
            expect(currentDate).not.toBeLessThan(previousDate);
        }
    });
    
    it("should convert tcx data with only one lap correctly", function() {
        var relativePathFitbitSurge = 'data/1998685994.tcx';
        var fitbitBuffer = readFileAsString(relativePathFitbitSurge);
        var route = converter.convert(fitbitBuffer);

        expect(route.device).toBe("Fitbit Surge");
        expect(route.distance).toBe(4780.29);
        expect(route.startTime).toBe("2016-03-20T21:30:36.000+02:00");
    });
});
