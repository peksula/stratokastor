var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var user = require('./user');
var authConfig = require('./authConfig');
var userModel = require('./userModel');

var instantiateNewUser = function (profile, token) {
    var newUser = {
        _id : profile.id,
        token : token,
        name  : profile.displayName
        //email : profile.emails[0].value // pull the first email
    };
    return newUser;
}

var findOrCreateUser = function(userModel, token, profile, done) {
    user.findOne(userModel, profile).then(function(existingUser) {
        if (existingUser) {
            return done(null, existingUser); // log the user in
        }
        else {
            // if the user isn't in our database, create a new user
            var newUser = instantiateNewUser(profile, token);

            user.create(userModel, newUser).then(function() {
                return done(null, newUser);
            })
            .catch(function(err){
                return done(err);
            });
        }
    })
    .catch(function(err){
        return done(err);
    });
};

exports.use = function(passport) {

    // Serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        user.findById(userModel, id).then(function(user) {
            done(null, user);
        })
        .catch(function(err) {
            done(err, user);
        });
    });
        
    const secrets = authConfig.secrets('production');

    passport.use(new GoogleStrategy(
        {
            clientID        : secrets.clientID,
            clientSecret    : secrets.clientSecret,
            callbackURL     : secrets.callbackURL,
            passReqToCallback: false // if true, the callback below will have req as the first param
        }, function(token, refreshToken, profile, done) {
            process.nextTick(function() {
                return findOrCreateUser(userModel, token, profile, done);
            });
        })
    );
};
