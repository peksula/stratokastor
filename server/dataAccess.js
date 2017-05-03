var dataConverterFactory = require('./dataConverterFactory')
var Promise = require("bluebird")

get_route_data = function(data) {
    var converter = dataConverterFactory.createConverter(data)
    if (converter) {
        return converter.convert(data) // returns a promise
    }
    return Promise.reject("No converter available.")
}

exports.check_access_rights = function(req, res, next, route) {
    if (route.user_id === req.user._id) {
        next()
    }
    else {
        res.send("Access denied.")
    }
}

exports.save_route = function (req, res, route) {
    get_route_data(res.locals.original_data).then(function(route_data) {
        var dateExecuted = new Date()
        if (typeof route_data.startTime !== "undefined") {
            dateExecuted = new Date(route_data.startTime)
        }
        var new_route = {
            title: res.locals.title,
            comment: res.locals.comment,
            weather: res.locals.weather,
            date: dateExecuted,
            original_data: res.locals.original_data,
            user_id: req.user._id,
            user_name: req.user.name
        }
        route.create(new_route).then(function(){
            res.redirect('/')
        })
    })
    .catch(function(err) {
        res.send(err)
    })    
}

exports.delete_route = function(req, res, next, route) {
    route.remove({_id : req.params.id}).then(function(){
        next()
    })
    .catch(function(err) {
        res.send(err)
    })
}

exports.update_route = function(req, res, next, route) {
    var updated_route = {
        title: req.body.title,
        comment: req.body.comment,
        weather: req.body.weather,
        updated_at: new Date()
    }
    route.findByIdAndUpdate(req.params.id, updated_route).then(function(route){
        next()    
    })
    .catch(function(err) {
        res.send(err)
    })
}

exports.get_route = function(req, res, route) {
    route.findById(req.params.id).then(function(route) {
        get_route_data(route.original_data).then(function(route_data) {
            var response = {
                _id: route._id,
                title: route.title,
                comment: route.comment,
                weather: route.weather,
                updated: route.updated_at,
                data: route_data,
                user_id: route.user_id,
                user_name: route.user_name
            }
            res.json(response)
        })
    })
    .catch(function(err) {
        res.send(err)
    })
}

exports.get_list_of_routes = function(res, route) {
    route.find({}, 'title date comment user_id', {sort: '-date'}).then(function(routes) {
        res.json(routes)
    })
    .catch(function(err) {
        res.send(err)
    })
}