describe("Route", function() {
  var Route = require('../models/route');
  var mongoose = require('mongoose');

  it("should contain one model", function() {
    expect(mongoose.modelNames().length).toBe(1);
  });

  it("should have a model named Route", function() {
    expect(mongoose.modelNames()[0]).toBe("Route");
  });

});
