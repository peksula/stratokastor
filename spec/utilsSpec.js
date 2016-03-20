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

describe("Climb since last point", function() {
    it("zero climb if elevation stays the same", function() {
        expect(utils.climbSinceLastPoint(1234, 1234)).toEqual(0);
    });

    it("zero climb if there is descent", function() {
        expect(utils.climbSinceLastPoint(1000, 1100)).toEqual(0);
    });

    it("correct climb in case of ascension", function() {
        expect(utils.climbSinceLastPoint(1334, 1234)).toEqual(100);
    });

    it("handles decimals correctly", function() {
        expect(utils.climbSinceLastPoint(13.25, 12.50)).toEqual(0.75);
    });

    it("rounds to 3 digit", function() {
        expect(utils.climbSinceLastPoint(12.933333333, 12.500)).toEqual(0.433);
    });

    it("returns 0 if no previous altitude exists", function() {
        expect(utils.climbSinceLastPoint(100, undefined)).toEqual(0);
    });
    
    it("works with string input", function() {
        expect(utils.climbSinceLastPoint("1334", "1234")).toEqual(100);
    });    
});

describe("Run time as string", function() {
    it("Zero seconds formatted correctly", function() {
        expect(utils.runTimeAsString("2016-02-24T22:05:49.000+02:00", "2016-02-24T22:05:49.000+02:00")).toEqual("0:00");
    });

    it("One digit formatted correctly", function() {
        expect(utils.runTimeAsString("2016-02-24T22:05:49.000+02:00", "2016-02-24T22:05:50.000+02:00")).toEqual("0:01");
    });

    it("Two digit formatted correctly", function() {
        expect(utils.runTimeAsString("2016-02-24T22:05:49.000+02:00", "2016-02-24T22:06:00.000+02:00")).toEqual("0:11");
    });

    it("Exact minute formatted correctly", function() {
        expect(utils.runTimeAsString("2016-02-24T22:05:49.000+02:00", "2016-02-24T22:06:49.000+02:00")).toEqual("1:00");
    });

    it("Over minute formatted correctly", function() {
        expect(utils.runTimeAsString("2016-02-24T22:05:49.000+02:00", "2016-02-24T22:06:50.000+02:00")).toEqual("1:01");
    });

    it("Exact hour formatted correctly", function() {
        expect(utils.runTimeAsString("2016-02-24T22:05:49.000+02:00", "2016-02-24T23:05:49.000+02:00")).toEqual("60:00");
    });

    it("Handles date boundary correctly", function() {
        expect(utils.runTimeAsString("2016-02-24T22:05:49.000+02:00", "2016-02-25T00:05:49.000+02:00")).toEqual("120:00");
    });

    it("Handles differing time zones correctly", function() {
        expect(utils.runTimeAsString("2016-02-24T22:05:49.000+02:00", "2016-02-24T23:05:49.000+01:00")).toEqual("120:00");
    });
});

