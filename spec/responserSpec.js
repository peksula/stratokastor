var responser = require('../server/responser');
var fs = require('fs');
var path = require('path');

var readFileAsString = function (relPath) {
    return fs.readFileSync(path.join(__dirname, relPath), { encoding: 'utf8' });
}

describe("Responser", function() {
    
    var route = null;
    
    beforeEach(function() {
        route = {
            create: function(route_data) {
                var dummy = route_data; // todo: remove
            }
        };
        
        spyOn(route, 'create');
        
    });

    it("dummy", function(done) {
        
        var relativePathFitbitSurge = 'data/993568829.tcx';
        var xml_route = readFileAsString(relativePathFitbitSurge);
        
        var reslocals = {
          original_data: xml_route,
          title: 'test run',
          weather: 'sunny',
          comment: 'nice'
        };
        var res = {
          locals: reslocals,
          redirect: function(address) {
              
          }
        };
        
        spyOn(res, 'redirect');
        
        responser.save(res, route).then(function() {
            var expected_route = {
                title: 'test run',
                comment: 'nice',
                weather: 'sunny',
                date: new Date('2015-11-30T21:51:29.000+02:00'),
                original_data: xml_route
            }

            expect(route.create).toHaveBeenCalledWith(expected_route, jasmine.any(Function));
            expect(res.redirect).toHaveBeenCalledWith('/');
            
            done();
        }).
        catch(function() {
            fail("Failed to save a route.")
            done()
        });
    });

});
