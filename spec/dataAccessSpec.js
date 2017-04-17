var dataAccess = require('../server/dataAccess')
var fs = require('fs')
var path = require('path')

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
        user = {
            _id: 112233,
            name: 'peksula'
        }
        req = {
          body: body,
          params: params,
          user: user
        }  
        next = {
            callback: function() {}
        }
    })

    beforeEach(function(){
        route = {
            user_id: 112233,
            user_name: 'peksula'
        }
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
        spyOn(next, 'callback')
        spyOn(res, 'json')
        spyOn(res, 'redirect')
        spyOn(res, 'send')
    })

    it("saves new route", function(done) {
        route.create = jasmine.createSpy("create spy").and.returnValue(Promise.resolve())
        dataAccess.save_route(req, res, route)
        done()
    })

    it("route save fails gracefully if data conversion fails", function(done) {
        delete res.locals.original_data // do not supply route so that saving fails
        route.create = jasmine.createSpy("create spy").and.returnValue(Promise.resolve())
        dataAccess.save_route(req, res, route)
        done()
    })

    it("route save fails gracefully", function(done) {
        route.create = jasmine.createSpy("create spy").and.returnValue(Promise.reject())
        dataAccess.save_route(req, res, route)
        done()
    })

    it("deletes a route", function(done) {
        route.remove = jasmine.createSpy("remove spy").and.returnValue(Promise.resolve())
        dataAccess.delete_route(req, res, next.callback, route)
        var expected = {
            _id : params.id
        }
        expect(route.remove).toHaveBeenCalledWith(expected)
        done()
    })

    it("fails gracefully if cannot delete route", function(done) {
        route.remove = jasmine.createSpy("remove spy").and.returnValue(Promise.reject())
        dataAccess.delete_route(req, res, next.callback, route)
        expect(route.remove).toHaveBeenCalledWith(jasmine.any(Object))
        done()
    })

    it("updates a route", function(done) {
        route.findByIdAndUpdate = jasmine.createSpy("findByIdAndUpdate spy").and.returnValue(Promise.resolve(route))
        var expected = {
            title: 'title',
            comment: 'comment',
            weather: 'weather',
            updated_at: new Date()
        }
        dataAccess.update_route(req, res, next.callback, route)
        expect(route.findByIdAndUpdate).toHaveBeenCalledWith(params.id, expected)
        done()
    })

    it("fails gracefully if cannot update route", function(done) {
        route.findByIdAndUpdate = jasmine.createSpy("findByIdAndUpdate spy").and.returnValue(Promise.reject("err"))
        dataAccess.update_route(req, res, next.callback, route)
        expect(route.findByIdAndUpdate).toHaveBeenCalledWith(params.id, jasmine.any(Object))
        done()
    })    

    it("gets a route", function(done) {
        route.original_data = xml_route
        route.findById = jasmine.createSpy("findById spy").and.returnValue(Promise.resolve(route))
        dataAccess.get_route(req, res, route)
        expect(route.findById).toHaveBeenCalledWith(params.id)
        done()
    })

    it("fails gracefully if cannot find a route", function(done) {
        route.findById = jasmine.createSpy("findById spy").and.returnValue(Promise.reject("err"))
        dataAccess.get_route(req, res, route)
        expect(route.findById).toHaveBeenCalledWith(params.id)
        done()
    })

    it("gets a list of routes", function(done) {
        route.find = jasmine.createSpy("find spy").and.returnValue(Promise.resolve("routes"))
        dataAccess.get_list_of_routes(res, route)
        expect(route.find).toHaveBeenCalledWith(jasmine.any(Object), 'title date comment user_id', jasmine.any(Object))
        done()
    })

    it("fails gracefully if cannot get a list of routes", function(done) {
        route.find = jasmine.createSpy("find spy").and.returnValue(Promise.reject("error"))
        dataAccess.get_list_of_routes(res, route)
        expect(route.find).toHaveBeenCalledWith(jasmine.any(Object), 'title date comment user_id', jasmine.any(Object))
        done()
    })

    it("grants access if user id matches to route owner", function() {
        dataAccess.check_access_rights(req, res, next.callback, route)
        expect(next.callback).toHaveBeenCalled()
    })

    it("denies access if user id does not match to route owner", function() {
        req.user._id = 998877
        dataAccess.check_access_rights(req, res, next.callback, route)
        expect(res.send).toHaveBeenCalledWith("Access denied.")
    })
})