var ac = require('../server/authConfig')

describe("AuthConfig", function() {
    it("should return production configuration when such is requested", function() {
        var secrets = ac.secrets('production')
        expect(secrets.clientID).toEqual("918728042559-7vplh1m9qanjp7vpdj8ul58mqkqls837.apps.googleusercontent.com")
        // not testing client secret here
        expect(secrets.callbackURL).toEqual("http://strato-kastor.rhcloud.com/auth/google/callback")
    })

    it("should return null otherwise", function() {
        var secrets = ac.secrets('localhost')
        expect(secrets).toEqual(null)
    })
})