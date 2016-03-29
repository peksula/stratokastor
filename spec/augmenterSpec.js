var fs = require('fs');
var path = require('path');

var readFileAsString = function (relPath) {
    return fs.readFileSync(path.join(__dirname, relPath), { encoding: 'utf8' });
}

describe("Filler", function() {

    it("dummy", function() {
        expect(1).toBe(1);
    });    
/*    
        for (i=1; i < dataPointCount; i++) {
            expect(route.dataPoints[i].percentage).not.toBeLessThan(route.dataPoints[i-1].percentage);
            expect(route.dataPoints[i].duration).not.toBe("");
            expect(route.dataPoints[i].distance).not.toBe("");
            expect(route.dataPoints[i].altitude).not.toBe("");
            expect(route.dataPoints[i].heartRate).toBe("");
            var currentDate = new Date(route.dataPoints[i].timeStamp);
            var previousDate = new Date(route.dataPoints[i-1].timeStamp);
            expect(currentDate).not.toBeLessThan(previousDate);
            expect(currentDate.getTime() - previousDate.getTime()).toBeLessThan(1001); // points are maximum one second apart
        }
*/
    
});
