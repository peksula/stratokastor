var utils = require('../server/utils')

describe("Percentage run", function() {
    it("returns zero percentage if current distance is zero", function() {
        expect(utils.percentageRun(0, 1000)).toEqual(0)
    })

    it("return zero percentage if total distance is zero", function() {
        expect(utils.percentageRun(0, 0)).toEqual(0)
    })

    it("returns 50% in the halfway", function() {
        expect(utils.percentageRun(50, 100)).toEqual(50)
    })

    it("returns 100% at the end", function() {
        expect(utils.percentageRun(750, 750)).toEqual(100)
    })

    it("rounds to 3 digit", function() {
        expect(utils.percentageRun(3, 9)).toEqual(33.333)
    })

    it("works with string input", function() {
        expect(utils.percentageRun("3", "9")).toEqual(33.333)
    })
})

describe("Seconds to next point", function() {
    it("detects one second difference", function() {
        expect(utils.secondsToNextPoint("2016-02-24T21:38:40.000+02:00", "2016-02-24T21:38:41.000+02:00")).toEqual(1)
    })

    it("treats less than second differences as zero", function() {
        expect(utils.secondsToNextPoint("2016-02-24T21:38:40.000+02:00", "2016-02-24T21:38:39.500+02:00")).toEqual(0)
    })

    it("detects one minute difference precisely correct", function() {
        expect(utils.secondsToNextPoint("2016-02-24T21:38:40.000+02:00", "2016-02-24T21:39:40.000+02:00")).toEqual(60)
    })

    it("survives different time zone inputs", function() {
        expect(utils.secondsToNextPoint("2016-02-24T21:38:40.000+02:00", "2016-02-24T19:39:40.000Z")).toEqual(60)
    })

})

describe("Climb since last point", function() {
    it("returns zero climb if elevation stays the same", function() {
        expect(utils.climbSinceLastPoint(1234, 1234)).toEqual(0)
    })

    it("returns zero climb if there is descent", function() {
        expect(utils.climbSinceLastPoint(1000, 1100)).toEqual(0)
    })

    it("returns correct climb in case of ascension", function() {
        expect(utils.climbSinceLastPoint(1334, 1234)).toEqual(100)
    })

    it("handles decimals correctly", function() {
        expect(utils.climbSinceLastPoint(13.25, 12.50)).toEqual(0.75)
    })

    it("rounds to 3 digit", function() {
        expect(utils.climbSinceLastPoint(12.933333333, 12.500)).toEqual(0.433)
    })

    it("returns zero if no previous altitude exists", function() {
        expect(utils.climbSinceLastPoint(100, undefined)).toEqual(0)
    })

    it("works with string input", function() {
        expect(utils.climbSinceLastPoint("1334", "1234")).toEqual(100)
    })
})

describe("Run time as string", function() {
    it("formats zero seconds correctly", function() {
        expect(utils.runTimeAsString("2016-02-24T22:05:49.000+02:00", "2016-02-24T22:05:49.000+02:00")).toEqual("0:00")
    })

    it("formats one digit seconds correctly", function() {
        expect(utils.runTimeAsString("2016-02-24T22:05:49.000+02:00", "2016-02-24T22:05:50.000+02:00")).toEqual("0:01")
    })

    it("formats two digit seconds correctly", function() {
        expect(utils.runTimeAsString("2016-02-24T22:05:49.000+02:00", "2016-02-24T22:06:00.000+02:00")).toEqual("0:11")
    });

    it("formats exact one minute correctly", function() {
        expect(utils.runTimeAsString("2016-02-24T22:05:49.000+02:00", "2016-02-24T22:06:49.000+02:00")).toEqual("1:00")
    })

    it("formats times over minute correctly", function() {
        expect(utils.runTimeAsString("2016-02-24T22:05:49.000+02:00", "2016-02-24T22:06:50.000+02:00")).toEqual("1:01")
    })

    it("formats exact one hour correctly", function() {
        expect(utils.runTimeAsString("2016-02-24T22:05:49.000+02:00", "2016-02-24T23:05:49.000+02:00")).toEqual("60:00")
    })

    it("handles date boundary correctly", function() {
        expect(utils.runTimeAsString("2016-02-24T22:05:49.000+02:00", "2016-02-25T00:05:49.000+02:00")).toEqual("120:00")
    })

    it("handles differing time zone inputs correctly", function() {
        expect(utils.runTimeAsString("2016-02-24T22:05:49.000+02:00", "2016-02-24T23:05:49.000+01:00")).toEqual("120:00")
    })
})

describe("Duration in minutes", function() {
    it("returns zero if start time equals end time", function() {
        expect(utils.durationInMinutes("2016-02-24T22:05:49.000+02:00", "2016-02-24T22:05:49.000+02:00")).toEqual(0)
    })

    it("returns one second if there is a one second difference", function() {
        expect(utils.durationInMinutes("2016-02-24T22:05:49.000+02:00", "2016-02-24T22:05:50.000+02:00")).toEqual(0.01667)
    })

    it("handles less than one minute case correctly", function() {
        expect(utils.durationInMinutes("2016-02-24T22:05:49.000+02:00", "2016-02-24T22:06:20.000+02:00")).toEqual(0.51667)
    })

    it("handles exact one minute difference correctly", function() {
        expect(utils.durationInMinutes("2016-02-24T22:05:49.000+02:00", "2016-02-24T22:06:49.000+02:00")).toEqual(1)
    })

    it("handles over one hour difference correctly", function() {
        expect(utils.durationInMinutes("2016-02-24T22:05:49.000+02:00", "2016-02-24T23:06:49.000+02:00")).toEqual(61)
    })
})

describe("Duration in hours", function() {
    it("returns zero when there is no time elapsed", function() {
        expect(utils.durationInHours("2016-02-24T22:05:49.000+02:00", "2016-02-24T22:05:49.000+02:00")).toEqual(0)
    })

    it("handles one second duration correctly", function() {
        expect(utils.durationInHours("2016-02-24T22:05:49.000+02:00", "2016-02-24T22:05:50.000+02:00")).toEqual(0.00028)
    })

    it("handles exact one minute duration correctly", function() {
        expect(utils.durationInHours("2016-02-24T22:05:49.000+02:00", "2016-02-24T22:06:49.000+02:00")).toEqual(0.01667)
    })

    it("handles duration of over one hour correctly", function() {
        expect(utils.durationInHours("2016-02-24T22:05:49.000+02:00", "2016-02-24T23:15:49.000+02:00")).toEqual(1.16667)
    })
})

describe("Kilometers per hour", function() {
    it("returns zero if no distance was covered", function() {
        expect(utils.kmh(0, 1)).toEqual(0)
    })

    it("returns zero if no time is elapsed", function() {
        expect(utils.kmh(1, 0)).toEqual(0)
    })

    it("returns correct speed when pace is low", function() {
        expect(utils.kmh(3500, 1.5)).toEqual(2.3)
    })

    it("handles string input correctly", function() {
        expect(utils.kmh("3500", "1.5")).toEqual(2.3)
    })
})

describe("Minutes per kilometer", function() {
    it("returns zero if no distance was covered", function() {
        expect(utils.minkm(0, 1)).toEqual(0)
    })

    it("returns zero if no time was elapsed", function() {
        expect(utils.minkm(1, 0)).toEqual(0)
    })

    it("returns correct speed when pace is slow", function() {
        expect(utils.minkm(500, 3)).toEqual(6)
    })

    it("handles string input correctly", function() {
        expect(utils.minkm("500", "3")).toEqual(6)
    })
})