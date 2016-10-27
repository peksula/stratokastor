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
            create: function() {},
            remove: function() {}
        };
        
        spyOn(route, 'create')
        spyOn(route, 'remove')
        
    });

    it("saves new route", function(done) {
        
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
          redirect: function(address) {}
        };
        
        spyOn(res, 'redirect');
        
        responser.save_route(res, route).then(function() {
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
    
    it("fails gracefully if cannot save new route", function(done) {
        
        var reslocals = {
          title: 'test run',
          weather: 'sunny',
          comment: 'nice'
        };
        var res = {
          locals: reslocals,
          send: function(err) {}
        };
        
        spyOn(res, 'send');
        
        responser.save_route(res, route).then(function() {
            var expected_route = {
                title: 'test run',
                comment: 'nice',
                weather: 'sunny',
                date: new Date('2015-11-30T21:51:29.000+02:00')
                //original_data: xml_route // do not supply route so that saving fails
            }

            fail("Saved an invalid route.")
            done();
        }).
        catch(function(err) {
            expect(res.send).toHaveBeenCalledWith(jasmine.any(Object));
            done()
        });
    });

    it("deletes a route", function(done) {
        
        var params = {
          id: 301
        }
        var req = {
          params: params
        }
        var res = {
          send: function(data) {}
        }
        var next = {
            callback: function() {}
        }
        
        spyOn(next, 'callback')
        
        responser.delete_route(req, res, next.callback, route)
        
        var expected = {
            _id : params.id
        }
        expect(route.remove).toHaveBeenCalledWith(expected, jasmine.any(Function));
        expect(next.callback).toHaveBeenCalled()
        done();
    });

});
