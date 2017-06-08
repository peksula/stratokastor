var route = require('./route')
var utils = require('./utils')
var jsUtils = require('./jsUtils')
var Promise = require("bluebird")
var xml2js = Promise.promisifyAll(require('xml2js'))

exports.convert = function (data) {

    var self = this
    self.laps = []

    self.setLaps = function(laps) {
        self.laps = laps
    }

    self.getStartTime = function() {
        return self.laps[0].Track.Trackpoint[0].Time // todo: lots of assumptions.. no error handling
    }

    self.getStartLatLon = function() {
        var lap = self.laps[0] // assumes laps are used, todo: don't assume.
        var firstTrackPoint = lap.Track.Trackpoint[0]
        return {
            lat: parseFloat(firstTrackPoint.Position.LatitudeDegrees),
            lng: parseFloat(firstTrackPoint.Position.LongitudeDegrees)
        }
    }

    self.getTotalDistance = function() {
        // Could just get the last DistanceMeters value, but there are
        // cases where DistanceMeters zeroes during the run. So this gets
        // last non-zero value.
        for (i = self.laps.length; i > 0; i--) {
            var lap = self.laps[i-1]
            for (j = lap.Track.Trackpoint.length; j > 0; j--) {
                var trackPoint = lap.Track.Trackpoint[j-1]
                if (parseFloat(trackPoint.DistanceMeters) > 0) {
                    return Math.round(trackPoint.DistanceMeters * 100) / 100
                }
            }
        }
        return 0
    }

    self.convertLap = function(lap, route) {
        var heartRateAtTrackPoint = function(trackPoint) {
            if (trackPoint.HeartRateBpm === undefined) {
                return "" // not all devices supply heart rate info, return empty string in that case
            }
            return trackPoint.HeartRateBpm.Value
        }

        var createDataPoint = function(tcxPoint) {
            var point = {
                timeStamp: tcxPoint.Time,
                altitude: route.getAltitude(),
                distance: tcxPoint.DistanceMeters,
                duration: utils.runTimeAsString(self.getStartTime(), tcxPoint.Time),
                kmh: 0,
                minkm: 0,
                climb: route.getTotalClimb(),
                heartRate: heartRateAtTrackPoint(tcxPoint),
                percentage: utils.percentageRun(tcxPoint.DistanceMeters, self.getTotalDistance())
            }
            var previousPoint = route.currentDataPoint()
            if (previousPoint) {
                distanceSinceLastPoint = parseFloat(point.distance) - parseFloat(previousPoint.distance)
                point.kmh = utils.kmh(distanceSinceLastPoint, utils.durationInHours(previousPoint.timeStamp, point.timeStamp))
                point.minkm = utils.minkm(distanceSinceLastPoint, utils.durationInMinutes(previousPoint.timeStamp, point.timeStamp))
            }
            return point
        }

        var createGeoPoint = function(tcxPoint) {
            var geoPoint = {
                lat: parseFloat(tcxPoint.Position.LatitudeDegrees),
                lng: parseFloat(tcxPoint.Position.LongitudeDegrees)
                }
            return geoPoint
        }

        var trackPoints = jsUtils.objectToArray(lap.Track.Trackpoint)
        trackPoints.forEach(function(trackPoint) {
            if (trackPoint.Position !== undefined) {
                route.addToTotalClimb(utils.climbSinceLastPoint(trackPoint.AltitudeMeters, route.altitude))
                route.setAltitude(parseFloat(trackPoint.AltitudeMeters))
                route.addDataPoint(createDataPoint(trackPoint))
                route.addGeoPoint(createGeoPoint(trackPoint))
            }
        })
    }

    self.constructRoute = function(json) {
        var laps = jsUtils.objectToArray(json.TrainingCenterDatabase.Activities.Activity.Lap)
        var device = json.TrainingCenterDatabase.Activities.Activity.Creator.Name
        return new route.route(laps, device, self)
    }

    return new Promise(function(resolve, reject) {
        xml2js.parseStringAsync(data, { explicitArray: false, ignoreAttrs: true })
            .then(function (result) {
                var route = self.constructRoute(result)
                return resolve(route)
            })
            .catch(function (err) {
                console.log(err)
                return reject()
            })
    })
}