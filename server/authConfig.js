exports.secrets = function(config) {
    const production = {
        clientID: "918728042559-7vplh1m9qanjp7vpdj8ul58mqkqls837.apps.googleusercontent.com",
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://strato-kastor.rhcloud.com/auth/google/callback"
    }
    if (config == 'production') {
        return production
    }
    else {
        return null
    }
}