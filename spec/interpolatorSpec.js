var interpolator = require('../server/interpolator');

describe("Number interpolator", function() {
    it("should work correctly with invalid input", function() {
        expect(interpolator.interpolateNumber(0, 0, 3)).toEqual([]);
    });

    it("should return empty with zero steps", function() {
        expect(interpolator.interpolateNumber(0, 1, 0)).toEqual([]);
    });

    it("should work correctly with one step", function() {
        expect(interpolator.interpolateNumber(0, 1, 1)).toEqual([0.5]);
    });

    it("should work correctly with two steps", function() {
        expect(interpolator.interpolateNumber(0, 9, 2)).toEqual([3, 6]);
    });

    it("should work correctly with three steps", function() {
        expect(interpolator.interpolateNumber(0, 10, 3)).toEqual([2.5, 5, 7.5]);
    });    
});

describe("Date interpolator", function() {

    it("should return empty with zero steps", function() {
        expect(interpolator.interpolateDate(
            "2015-11-30T22:07:08.000+02:00",
            "2015-11-30T22:07:08.000+02:00", 0)).toEqual([]);
    });

    it("should work correctly with one step", function() {
        expect(interpolator.interpolateDate(
            "2015-11-30T22:07:08.000+02:00",
            "2015-11-30T22:07:10.000+02:00", 1)).toEqual([
                "2015-11-30T20:07:09.000Z"]);
    });

    it("should work correctly with two steps", function() {
        expect(interpolator.interpolateDate(
            "2015-11-30T22:07:00.000+02:00",
            "2015-11-30T22:07:09.000+02:00", 2)).toEqual([
                "2015-11-30T20:07:03.000Z",
                "2015-11-30T20:07:06.000Z"]);
    });

    it("correctly crosses minute boundary", function() {
        expect(interpolator.interpolateDate(
            "2015-11-30T22:07:59.000+02:00",
            "2015-11-30T22:08:02.000+02:00", 2)).toEqual([
                "2015-11-30T20:08:00.000Z",
                "2015-11-30T20:08:01.000Z"]);
    });

    it("correctly crosses hour boundary", function() {
        expect(interpolator.interpolateDate(
            "2015-11-30T22:59:59.000+02:00",
            "2015-11-30T23:00:02.000+02:00", 2)).toEqual([
                "2015-11-30T21:00:00.000Z",
                "2015-11-30T21:00:01.000Z"]);
    });
});
