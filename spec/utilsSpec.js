var utils = require('../server/utils');

describe("Percentage run", function() {
    it("zero percentage if current distance is zero", function() {
        expect(utils.percentageRun(0, 1000)).toEqual(0);
    });

    it("zero percentage if total distance is zero", function() {
        expect(utils.percentageRun(0, 0)).toEqual(0);
    });

    it("50% in halfway", function() {
        expect(utils.percentageRun(50, 100)).toEqual(50);
    });

    it("100% at end", function() {
        expect(utils.percentageRun(750, 750)).toEqual(100);
    });

    it("rounds to 3 digit", function() {
        expect(utils.percentageRun(3, 9)).toEqual(33.333);
    });
    
    it("works with string input", function() {
        expect(utils.percentageRun("3", "9")).toEqual(33.333);
    });    
});

describe("Seconds to next point", function() {
    it("detects one second difference", function() {
        expect(utils.secondsToNextPoint("2016-02-24T21:38:40.000+02:00", "2016-02-24T21:38:41.000+02:00")).toEqual(1);
    });

    it("less than second difference is zero", function() {
        expect(utils.secondsToNextPoint("2016-02-24T21:38:40.000+02:00", "2016-02-24T21:38:39.500+02:00")).toEqual(0);
    });

    it("detects one minute difference", function() {
        expect(utils.secondsToNextPoint("2016-02-24T21:38:40.000+02:00", "2016-02-24T21:39:40.000+02:00")).toEqual(60);
    });

    it("survives different time zone inputs", function() {
        expect(utils.secondsToNextPoint("2016-02-24T21:38:40.000+02:00", "2016-02-24T19:39:40.000Z")).toEqual(60);
    });

});
