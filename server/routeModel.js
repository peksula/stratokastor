var mongoose = require('mongoose');
 
var RouteSchema = new mongoose.Schema({
    title           : String,
    comment         : String,
    weather         : String,
    date            : { type: Date, default: Date.now },
    updated_at      : { type: Date, default: Date.now },
    original_data   : String
});
 
module.exports = mongoose.model('Route', RouteSchema);