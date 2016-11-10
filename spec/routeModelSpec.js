var Route = require('../server/routeModel')
var mongoose = require('mongoose')

describe("RouteModel", function() {

    it("should contain one model", function() {
        expect(mongoose.modelNames().length).toBe(1)
    })

    it("should have a model named Route", function() {
        expect(mongoose.modelNames()[0]).toBe("Route")
    })
})
