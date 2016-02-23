describe("PublicUtils", function() {
  var utils = require('../public/utils');

  it("should return zero percentage if no progress", function() {
    expect(utils.percentageRun(0,1)).toBe(0);
  });

  it("should return 100 percentage if complete", function() {
    expect(utils.percentageRun(3,3)).toBe(100);
  });

  it("should return 50 percentage when halfway", function() {
    expect(utils.percentageRun(2,4)).toBe(50);
  });

  
});
