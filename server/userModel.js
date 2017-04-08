var mongoose = require('mongoose')

var UserSchema = new mongoose.Schema({
    _id: String,
    token: String,
    email: String,
    name: String
})
UserSchema.index({ "_id": 1 })

module.exports = mongoose.model('User', UserSchema)