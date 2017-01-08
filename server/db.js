var mongoose = require('mongoose')

if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
    var connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    process.env.OPENSHIFT_APP_NAME

    mongoose.connect('mongodb://' + connection_string)
}