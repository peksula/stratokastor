var dataConverterFactory = require('./dataConverterFactory')
var Promise = require("bluebird")

get_route_data = function(data) {
    var converter = dataConverterFactory.createConverter(data)
    if (converter) {
        return converter.convert(data) // returns a promise
    }
    return Promise.reject("No converter available.")
}

exports.save_route = function (res, route) {

    return new Promise(function(resolve, reject) {        
        get_route_data(res.locals.original_data).then(function(route_data) {
            var dateExecuted = new Date();
            if (typeof route_data.startTime !== "undefined") {
                dateExecuted = new Date(route_data.startTime);
            }
            route.create({
                title: res.locals.title,
                comment: res.locals.comment,
                weather: res.locals.weather,
                date: dateExecuted,
                original_data: res.locals.original_data
            }, function(err, _route) {
                if (err) {
                    res.send(err)
                    return reject(err)
                }
            });
            res.redirect('/')
            return resolve()
        }).
        catch(function(err) {
            res.send(err)
            return reject()
        })
    })
}

exports.delete_route = function(req, res, next, route) {
    route.remove({
        _id : req.params.id
    }, function(err, route) {
        if (err) {
            res.send(err)
        }
    })
    next()
}

exports.update_route = function(req, res, next, route) {
    var title = req.body.title
    var comment = req.body.comment
    var weather = req.body.weather
    route.findByIdAndUpdate(
        req.params.id,
        {
            title: title,
            comment: comment,
            weather: weather,
            updated_at: new Date()
        },
        function(err, route) {
        if (err) {
            res.send(err)
        }
    })
    next()
}

exports.get_route = function(req, res, route) {
    return new Promise(function(resolve, reject) {
        route.findById(req.params.id, function(err, foundRoute) {
            if (err) {
                res.send(err)
                return reject()
            }
            else {
                get_route_data(foundRoute.original_data).then(function(route_data) {
                    var response = {
                        _id: foundRoute._id,
                        title: foundRoute.title,
                        comment: foundRoute.comment,
                        weather: foundRoute.weather,
                        updated: foundRoute.updated_at,
                        data: route_data
                    }
                    res.json(response)
                    return resolve()
                })
                .catch(function(err) {
                    res.send(err)
                    return reject()
                })
            }
        })
    })
}

exports.get_list_of_routes = function(res, route) {
    route.find({}, 'title date comment', {sort: '-date'}, function(err, routes) {
        if (err) {
            res.send(err)
        }
        res.json(routes)
    })
}