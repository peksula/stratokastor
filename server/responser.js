var dataConverterFactory = require('./dataConverterFactory');
var Promise = require("bluebird");

get_route_data = function(data) {
    return new Promise(function(resolve, reject) {
        var converter = dataConverterFactory.createConverter(data);
        converter.convert(data).then(function(route_data) {
            return resolve(route_data);
        })
        .catch(function() {
            return reject();
        });
    });
};


exports.save = function (res, route) {

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
                    console.log('Error creating database entry %s', err);
                    res.send(err);
                }
            });
            res.redirect('/');
            return resolve();
        }).
        catch(function() {
            return reject();
        });
    });
};
