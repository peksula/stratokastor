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
            res.send(err);
        }
    })
    next()
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
                data: route_data
            }
            res.json(response)
        })
    })
    .catch(function(err) {
        res.send(err)
    })
}

exports.get_list_of_routes = function(res, route) {
    route.find({}, 'title date comment', {sort: '-date'}).then(function(routes) {
        res.json(routes)
    })
    .catch(function(err) {
        res.send(err)
    })
}