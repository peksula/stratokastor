describe("Route", function() {
  var parser = require('../server/formParser');

  it("should copy textual data from several separate fields", function() {
    var fieldsArray = {};
    var resLocals = {};
    fieldsArray.title = "My Route";
    fieldsArray.comment = "My Comment";
    
    parser.formToResLocals(fieldsArray, resLocals);
    
    expect(resLocals["title"]).toBe("My Route");
    expect(resLocals["comment"]).toBe("My Comment");
  });

});
