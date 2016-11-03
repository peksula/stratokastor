var dataConverterFactory = require('./dataConverterFactory')
var Promise = require("bluebird")

get_route_data = function(data) {
    return new Promise(function(resolve, reject) {
        var converter = dataConverterFactory.createConverter(data);
        converter.convert(data).then(function(route_data) {
            return resolve(route_data)
        })
        .catch(function() {
            return reject()
        })
    })
}

exports.save_route = function (res, route) {

    return new Promise(function(resolve, reject) {
        get_route_data(res.locals.original_data).then(function(route_data) {
            var dateExecuted = new Date();
            if (route_data.startTime !== undefined) {
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
                    //console.log('Error creating database entry %s', err);
                    res.send(err);
                    return reject(err)
                }
            });
            res.redirect('/');
            return resolve();
        }).
        catch(function(err) {
            res.send(err)
            return reject();
        });
    });
};

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
    var title = req.body.title;
    var comment = req.body.comment;
    var weather = req.body.weather;        
    //console.log('Updating %s %s %s.', title, comment, weather);
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
            //console.log('Error updating database entry %s', err);
            res.send(err);
        }
    });
    next()
}

exports.get_route = function(req, res, route) {
    return new Promise(function(resolve, reject) {
        route.findById(req.params.id, function(err, route) {
            if (err) {
                //console.log('Error occurred when getting a detailed route from database %s', err)
                res.send(err)
                return reject()
            }
            else {
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
            //console.log('Error occurred when getting list from database %s', err);
            res.send(err);
        }
        res.json(routes);
    })
}