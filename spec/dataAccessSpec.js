var dataAccess = require('../server/dataAccess');
var fs = require('fs');
var path = require('path');

var readFileAsString = function (relPath) {
    return fs.readFileSync(path.join(__dirname, relPath), { encoding: 'utf8' });
}

describe("DataAccess", function() {

    var route = null
    
    beforeEach(function(){
        route = {}
    })

    it("saves new route", function(done) {
        var relativePathFitbitSurge = 'data/993568829.tcx'
        var xml_route = readFileAsString(relativePathFitbitSurge)
        
        var reslocals = {
          original_data: xml_route,
          title: 'test run',
          weather: 'sunny',
          comment: 'nice'
        }
        var res = {
          locals: reslocals,
          redirect: function(address) {}
        }
        
        spyOn(res, 'redirect')
        route.create = jasmine.createSpy("create() spy")
        
        dataAccess.save_route(res, route).then(function() {
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

    it("route save fails gracefully if data conversion fails", function(done) {
        
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
        
        route.create = jasmine.createSpy("create() spy")
        
        dataAccess.save_route(res, route).then(function() {
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
            expect(res.send).toHaveBeenCalledWith("No converter available.");
            done()
        });
    })

    it("route save fails gracefully if database fails", function(done) {

        var relativePathFitbitSurge = 'data/993568829.tcx'
        var xml_route = readFileAsString(relativePathFitbitSurge)

        var reslocals = {
          original_data: xml_route,
          title: 'test run',
          weather: 'sunny',
          comment: 'nice'
        }

        var res = {
          locals: reslocals,
          send: function(err) {}
        };
        
        spyOn(res, 'send');
        
        route.create = jasmine.createSpy("create() spy").and.callFake(function() {
            route.create.calls.mostRecent().args[1](404, null) // call the function that was supplied as second argument
        })
        dataAccess.save_route(res, route).then(function() {
            var expected_route = {
                title: 'test run',
                comment: 'nice',
                weather: 'sunny',
                date: new Date('2015-11-30T21:51:29.000+02:00'),
                original_data: xml_route
            }

            fail("Indicates save was succesfull although it was not.")
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
        route.remove = jasmine.createSpy("remove() spy")

        dataAccess.delete_route(req, res, next.callback, route)
        
        var expected = {
            _id : params.id
        }
        expect(route.remove).toHaveBeenCalledWith(expected, jasmine.any(Function));
        expect(next.callback).toHaveBeenCalled()
        done();
    })

    it("fails gracefully if cannot delete route", function(done) {
        
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
        
        spyOn(res, 'send')
        route.remove = jasmine.createSpy("remove() spy").and.callFake(function() {
            route.remove.calls.mostRecent().args[1](404, null)
        })

        dataAccess.delete_route(req, res, next.callback, route)
        
        var expected = {
            _id : params.id
        }
        expect(route.remove).toHaveBeenCalledWith(expected, jasmine.any(Function));
        expect(res.send).toHaveBeenCalledWith(404)
        done();
    })

    it("updates a route", function(done) {
        
        var body = {
          title: 'title',
          comment: 'comment',
          weather: 'weather'
        }
        var params = {
          id: 301
        }
        var req = {
          body: body,
          params: params
        }
        var res = {
            send: function(data) {}
        }
        var next = {
            callback: function() {}
        }
        
        spyOn(next, 'callback')
        route.findByIdAndUpdate = jasmine.createSpy("findByIdAndUpdate() spy")

        dataAccess.update_route(req, res, next.callback, route)
        expect(route.findByIdAndUpdate).toHaveBeenCalledWith(params.id, jasmine.any(Object), jasmine.any(Function))
        expect(next.callback).toHaveBeenCalled()
        done()
    })
    
    it("fails gracefully if cannot update route", function(done) {
        
        var body = {
          title: 'title',
          comment: 'comment',
          weather: 'weather'
        }
        var params = {
          id: 301
        }
        var req = {
          body: body,
          params: params
        }
        var res = {
            send: function(data) {}
        }
        var next = {
            callback: function() {}
        }
        
        spyOn(res, 'send')
        route.findByIdAndUpdate = jasmine.createSpy("findByIdAndUpdate() spy").and.callFake(function() {
            route.findByIdAndUpdate.calls.mostRecent().args[2](404, null)
        })

        dataAccess.update_route(req, res, next.callback, route)
        expect(route.findByIdAndUpdate).toHaveBeenCalledWith(params.id, jasmine.any(Object), jasmine.any(Function))
        expect(res.send).toHaveBeenCalledWith(404)
        done()
    })    

    it("gets a route", function(done) {
        
        var relativePathFitbitSurge = 'data/993568829.tcx';
        var xml_route = readFileAsString(relativePathFitbitSurge);
        route.original_data = xml_route

        var params = {
          id: 301
        }
        var req = {
          params: params
        }
        var res = {
          json: function(response) {},
          send: function(data) {}
        }

        spyOn(res, 'json')

        route.findById = jasmine.createSpy("findById() spy").and.callFake(function() {
            route.findById.calls.mostRecent().args[1](null, route)
        })
        dataAccess.get_route(req, res, route).then(function(){
            var expected_id = {
                id : params.id
            }
            expect(route.findById).toHaveBeenCalledWith(params.id, jasmine.any(Function));
            expect(res.json).toHaveBeenCalledWith(jasmine.any(Object))
            done()
        })
        .catch(function(err) {
            fail("Failed to get a route " + err)
            done()
        })
    })

    it("route get fails gracefully in case of db error", function(done) {
        var params = {
          id: 301
        }
        var req = {
          params: params
        }
        var res = {
          json: function(response) {},
          send: function(data) {}
        }

        spyOn(res, 'send')

        route.findById = jasmine.createSpy("findById() spy").and.callFake(function() {
            route.findById.calls.mostRecent().args[1](400, null) // call the function that was supplied as second argument, simulate db error
        })
        dataAccess.get_route(req, res, route).then(function(){
            fail("Route get db error not handled correctly.")
            done()
        })
        .catch(function() {
            var expected_id = {
                id : params.id
            }        
            expect(route.findById).toHaveBeenCalledWith(params.id, jasmine.any(Function));
            expect(res.send).toHaveBeenCalledWith(400)
            done()
        })
    })
    
    it("route get fails gracefully in data conversion error", function(done) {
        var params = {
          id: 301
        }
        var req = {
          params: params
        }
        var res = {
          json: function(response) {},
          send: function(data) {}
        }

        spyOn(res, 'send')

        route.findById = jasmine.createSpy("findById() spy").and.callFake(function() {
            route.findById.calls.mostRecent().args[1](404, route) // call the function that was supplied as second argument, simulate data conversion error
        })
        dataAccess.get_route(req, res, route).then(function(){
            fail("Route get data conversion error not handled correctly.")
            done()
        })
        .catch(function() {
            var expected_id = {
                id : params.id
            }        
            expect(route.findById).toHaveBeenCalledWith(params.id, jasmine.any(Function))
            //expect(res.send).toHaveBeenCalledWith(jasmine.any(Object))
            expect(res.send).toHaveBeenCalledWith(404)
            done()
        })
    })
    
    it("gets a list of routes", function(done) {

        var routes = {}
        var res = {
            send: function(data) {},
            json: function(data) {}
        }
        
        spyOn(res, 'json')
        route.find = jasmine.createSpy("find() spy").and.callFake(function() {
            route.find.calls.mostRecent().args[3](null, routes)
        })

        dataAccess.get_list_of_routes(res, route)

        expect(route.find).toHaveBeenCalledWith(jasmine.any(Object), 'title date comment', jasmine.any(Object), jasmine.any(Function))
        expect(res.json).toHaveBeenCalledWith(routes)
        done()
    })

    it("fails gracefully if cannot get a list of routes", function(done) {

        var res = {
            send: function(data) {},
            json: function(data) {}
        }
        
        spyOn(res, 'send')
        route.find = jasmine.createSpy("find() spy").and.callFake(function() {
            route.find.calls.mostRecent().args[3](404, null)
        })

        dataAccess.get_list_of_routes(res, route)

        expect(route.find).toHaveBeenCalledWith(jasmine.any(Object), 'title date comment', jasmine.any(Object), jasmine.any(Function))
        expect(res.send).toHaveBeenCalled()
        done()
    })

})