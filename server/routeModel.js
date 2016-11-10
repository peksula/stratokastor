var mongoose = require('mongoose')

var RouteSchema = new mongoose.Schema({
    title           : String,
    comment         : String,
    weather         : String,
    date            : { type: Date, default: Date.now },
    updated_at      : { type: Date, default: Date.now },
    original_data   : String
})
RouteSchema.index({ "date": 1 })

module.exports = mongoose.model('Route', RouteSchema)