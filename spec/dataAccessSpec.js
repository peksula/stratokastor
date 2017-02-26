var dataAccess = require('../server/dataAccess');
var fs = require('fs');
var path = require('path');

var readFileAsString = function (relPath) {
    return fs.readFileSync(path.join(__dirname, relPath), { encoding: 'utf8' });
}

describe("DataAccess", function() {

    var body, next, params
    var req, res, reslocals
    var route, xml_route
    
    beforeAll(function(){
        var relativePathFitbitSurge = 'data/993568829.tcx'
        xml_route = readFileAsString(relativePathFitbitSurge)
        body = {
          title: 'title',
          comment: 'comment',
          weather: 'weather'
        }
        params = {
          id: 301
        }
        req = {
          body: body,
          params: params
        }  
        next = {
            callback: function() {}
        }
    })

    beforeEach(function(){
        route = {}
        reslocals = {
          original_data: xml_route,
          title: 'test run',
          weather: 'sunny',
          comment: 'nice'
        }
        res = {
            locals: reslocals,
            send: function(data) {},
            json: function(data) {},
            redirect: function(address) {}
        }
        spyOn(res, 'json')
        spyOn(next, 'callback')
        spyOn(res, 'redirect')
        spyOn(res, 'send')
    })

    it("saves new route", function(done) {
        route.create = jasmine.createSpy("create() spy")
        dataAccess.save_route(res, route).then(function() {
            var expected_route = {
                title: 'test run',
                comment: 'nice',
                weather: 'sunny',
                date: new Date('2015-11-30T21:51:29.000+02:00'),
                original_data: xml_route
            }
            expect(route.create).toHaveBeenCalledWith(expected_route, jasmine.any(Function))
            expect(res.redirect).toHaveBeenCalledWith('/')
            done()
        }).
        catch(function() {
            done.fail("Failed to save a route.")
        })
    })

    it("route save fails gracefully if data conversion fails", function(done) {
        delete res.locals.original_data // do not supply route so that saving fails
        route.create = jasmine.createSpy("create() spy")
        dataAccess.save_route(res, route).then(function() {
            done.fail("Saved an invalid route.")
        }).
        catch(function(err) {
            expect(res.send).toHaveBeenCalledWith("No converter available.")
            done()
        })
    })

    it("route save fails gracefully if database fails", function(done) {
        route.create = jasmine.createSpy("create() spy").and.callFake(function() {
            route.create.calls.mostRecent().args[1](404, null) // call the function that was supplied as second argument
        })
        dataAccess.save_route(res, route).then(function() {
            done.fail("Indicates save was succesfull although it was not.")
        }).
        catch(function(err) {
            expect(res.send).toHaveBeenCalledWith(404)
            done()
        })
    })

    it("deletes a route", function(done) {
        route.remove = jasmine.createSpy("remove() spy")
        dataAccess.delete_route(req, res, next.callback, route)        
        var expected = {
            _id : params.id
        }
        expect(route.remove).toHaveBeenCalledWith(expected, jasmine.any(Function))
        expect(next.callback).toHaveBeenCalled()
        done()
    })

    it("fails gracefully if cannot delete route", function(done) {
        route.remove = jasmine.createSpy("remove() spy").and.callFake(function() {
            route.remove.calls.mostRecent().args[1](404, null)
        })
        dataAccess.delete_route(req, res, next.callback, route)
        var expected = {
            _id : params.id
        }
        expect(route.remove).toHaveBeenCalledWith(expected, jasmine.any(Function))
        expect(res.send).toHaveBeenCalledWith(404)
        done()
    })

    it("updates a route", function(done) {
        route.findByIdAndUpdate = jasmine.createSpy("findByIdAndUpdate() spy")
        dataAccess.update_route(req, res, next.callback, route)
        expect(route.findByIdAndUpdate).toHaveBeenCalledWith(params.id, jasmine.any(Object), jasmine.any(Function))
        expect(next.callback).toHaveBeenCalled()
        done()
    })

    it("fails gracefully if cannot update route", function(done) {
        route.findByIdAndUpdate = jasmine.createSpy("findByIdAndUpdate() spy").and.callFake(function() {
            route.findByIdAndUpdate.calls.mostRecent().args[2](404, null)
        })
        dataAccess.update_route(req, res, next.callback, route)
        expect(route.findByIdAndUpdate).toHaveBeenCalledWith(params.id, jasmine.any(Object), jasmine.any(Function))
        expect(res.send).toHaveBeenCalledWith(404)
        done()
    })    

    it("gets a route", function(done) {
        route.original_data = xml_route
        route.findById = jasmine.createSpy("findById() spy").and.callFake(function() {
            route.findById.calls.mostRecent().args[1](null, route)
        })
        dataAccess.get_route(req, res, route).then(function(){
            expect(route.findById).toHaveBeenCalledWith(params.id, jasmine.any(Function))
            expect(res.json).toHaveBeenCalledWith(jasmine.any(Object))
            done()
        })
        .catch(function(err) {
            done.fail("Failed to get a route " + err)
        })
    })

    it("route get fails gracefully in case of db error", function(done) {
        route.findById = jasmine.createSpy("findById() spy").and.callFake(function() {
            route.findById.calls.mostRecent().args[1](400, null)
        })
        dataAccess.get_route(req, res, route).then(function(){
            done.fail("Route get db error not handled correctly.")
        })
        .catch(function() {
            expect(route.findById).toHaveBeenCalledWith(params.id, jasmine.any(Function))
            expect(res.send).toHaveBeenCalledWith(400)
            done()
        })
    })

    it("route get fails gracefully in data conversion error", function(done) {
        route.findById = jasmine.createSpy("findById() spy").and.callFake(function() {
            route.findById.calls.mostRecent().args[1](404, route)
        })
        dataAccess.get_route(req, res, route).then(function(){
            fail("Route get data conversion error not handled correctly.")
            done()
        })
        .catch(function() {
            expect(route.findById).toHaveBeenCalledWith(params.id, jasmine.any(Function))
            expect(res.send).toHaveBeenCalledWith(404)
            done()
        })
    })

    it("gets a list of routes", function(done) {
        var routes = {}
        route.find = jasmine.createSpy("find() spy").and.callFake(function() {
            route.find.calls.mostRecent().args[3](null, routes)
        })
        dataAccess.get_list_of_routes(res, route)
        expect(route.find).toHaveBeenCalledWith(jasmine.any(Object), 'title date comment', jasmine.any(Object), jasmine.any(Function))
        expect(res.json).toHaveBeenCalledWith(routes)
        done()
    })

    it("fails gracefully if cannot get a list of routes", function(done) {
        route.find = jasmine.createSpy("find() spy").and.callFake(function() {
            route.find.calls.mostRecent().args[3](404, null)
        })
        dataAccess.get_list_of_routes(res, route)
        expect(route.find).toHaveBeenCalledWith(jasmine.any(Object), 'title date comment', jasmine.any(Object), jasmine.any(Function))
        expect(res.send).toHaveBeenCalled()
        done()
    })
})