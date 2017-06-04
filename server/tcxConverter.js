var route = require('./route')
var jsUtils = require('./jsUtils')
var Promise = require("bluebird")
var xml2js = Promise.promisifyAll(require('xml2js'))

exports.convert = function (data) {

    var constructRoute = function(json) {
        var laps = jsUtils.objectToArray(json.TrainingCenterDatabase.Activities.Activity.Lap)
        var device = json.TrainingCenterDatabase.Activities.Activity.Creator.Name
        return new route.route(laps, device)
    }

    return new Promise(function(resolve, reject) {
        xml2js.parseStringAsync(data, { explicitArray: false, ignoreAttrs: true })
            .then(function (result) {
                var route = constructRoute(result)
                return resolve(route)
            })
            .catch(function (err) {
                console.log(err)
                return reject()
            })
    })
}