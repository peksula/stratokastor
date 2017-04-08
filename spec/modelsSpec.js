var Route = require('../server/routeModel')
var mongoose = require('mongoose')

describe("Models", function() {

    it("should contain two models", function() {
        expect(mongoose.modelNames().length).toBe(2)
    })

    it("should have a models named Route and User", function() {
        expect(mongoose.modelNames().indexOf("Route")).not.toBe(-1)
        expect(mongoose.modelNames().indexOf("User")).not.toBe(-1)
    })
})
