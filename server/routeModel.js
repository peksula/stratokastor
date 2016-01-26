var mongoose = require('mongoose');
 
var RouteSchema = new mongoose.Schema({
    title           : String,
    comment         : String,
    weather         : String,
    original_data   : String/*
    date       : Date
    trackpoints : [
    {
        latitude    : String,
        longitude   : String,
        altitude    : String,
        time        : Date
    }]*/
});
 
module.exports = mongoose.model('Route', RouteSchema);