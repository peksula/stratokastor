var Promise = require("bluebird")
var mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

exports.create = function (userModel, newUser) {
    return userModel.create(newUser)
}

exports.findOne = function(userModel, profile) {
    return userModel.findOne({ '_id' : profile.id })
}

exports.findById = function(userModel, id) {
    return userModel.findById(id)
}

exports.getAll = function(userModel) {
    return userModel.find({}, 'name', {sort: '-name'})
}