var user = require('../server/user')
var userModel = require('../server/userModel')

describe("User", function() {

    beforeEach(function(){
    })

    it("creates new user", function(done) {

        var newUser = {
            id : "123",
            token : "token",
            name  : "artie",
            email : "artie@rd.com"
        }

        userModel.create = function(user) {
            return Promise.resolve(newUser)
        }

        user.create(userModel, newUser).then(function(user) {
            expect(user).toEqual(newUser)
            done()
        }).
        catch(function() {
            fail("Failed to create a user.")
            done()
        })
    })

    it("create new user fails gracefully if db call fails", function(done) {

        userModel.create = function(user) {
            return Promise.reject("error")
        }

        var newUser = {
            id : "123",
            token : "token",
            name  : "artie",
            email : "artie@rd.com"
        }

        user.create(userModel, newUser).then(function(user) {
            fail("Created an invalid user.")
            done()
        }).
        catch(function(err) {
            expect(err).toEqual("error")
            done()
        })
    })

    it("finds existing user", function(done) {
        var profile = {}

        userModel.findOne = function() {
            return Promise.resolve("user")
        }

        user.findOne(userModel, profile).then(function(user) {
            expect(user).toEqual("user")
            done()
        }).
        catch(function() {
            fail("Failed to find existing user.")
            done()
        })
    })

    it("fails gracefully if database find fails", function(done) {
        var profile = {}

        userModel.findOne = function() {
            return Promise.reject("error")
        }

        user.findOne(userModel, profile).then(function(user) {
            fail("Returned success although database failed.")
            done()
        }).
        catch(function(err) {
            expect(err).toEqual("error")
            done()
        })
    })

    it("finds existing user by id", function(done) {
        var id = "123"

        userModel.findById = function(id) {
            return Promise.resolve("user")
        }

        user.findById(userModel, id).then(function(user) {
            expect(user).toEqual("user")
            done()
        }).
        catch(function() {
            fail("Failed to find existing user by id.")
            done()
        })
    })

    it("fails gracefully if database find by id fails", function(done) {
        var id = "666"
        
        userModel.findById = function(id) {
            return Promise.reject("error")
        }

        user.findById(userModel, id).then(function(user) {
            fail("Returned success although database failed.")
            done()
        }).
        catch(function(err) {
            expect(err).toEqual("error")
            done()
        })
    })

    it("finds all users", function(done) {
        var id = "123"

        userModel.find = function() {
            var users = 
                [ { name: "Adrianus", email: "big.boss@company.com" },
                  { name: "Luna", email: "secretary@company.com" } ]
            return Promise.resolve(users)
        }
        user.getAll(userModel).then(function(users) {
            expect(users.length).toBe(2)
            expect(users[0].name).toEqual("Adrianus")
            done()
        }).
        catch(function() {
            fail("Failed to get all users.")
            done()
        })
    })

    it("fails gracefully if database find fails", function(done) {
        var id = "666"

        userModel.find = function() {
            return Promise.reject("error")
        }

        user.getAll(userModel).then(function(users) {
            fail("Returned success although database failed.")
            done()
        }).
        catch(function(err) {
            expect(err).toEqual("error")
            done()
        })
    })
})