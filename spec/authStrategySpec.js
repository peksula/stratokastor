var as = require('../server/authStrategy')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

describe("AuthStrategy", function() {

    var passport = {};
    var userModel = {};

    beforeAll(function(){
        passport.use = jasmine.createSpy("use spy");
        passport.serializeUser = jasmine.createSpy("serializeUser spy");
        passport.deserializeUser = jasmine.createSpy("deserializeUser spy");
    })

    it("should serialize and deserialize user", function() {
        as.use(passport, userModel);
        expect(passport.serializeUser).toHaveBeenCalledWith(jasmine.any(Function));
        expect(passport.deserializeUser).toHaveBeenCalledWith(jasmine.any(Function));
    })

    it("should use Google authentication strategy", function() {
        as.use(passport, userModel);
        expect(passport.use).toHaveBeenCalledWith(jasmine.any(Object));
        expect(passport.use.calls.mostRecent().args[0].name).toEqual("google");
        expect(passport.use.calls.mostRecent().args[0]._oauth2._clientId).toEqual("918728042559-7vplh1m9qanjp7vpdj8ul58mqkqls837.apps.googleusercontent.com");
        // not testing the client secret here
        expect(passport.use.calls.mostRecent().args[0]._callbackURL).toEqual("http://strato-kastor.rhcloud.com/auth/google/callback");
    })
})