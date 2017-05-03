var utils = require('./utils')
var Promise = require("bluebird")
var xml2js = Promise.promisifyAll(require('xml2js'))

exports.convert = function (data) {
    // todo in desperate need of refactoring
    function route(startTime, device, dataPoints, duration, distance, climb, startLat, startLng, kmh, minkm, geoPoints) {
        this.startTime = startTime
        this.device = device
        this.dataPoints = dataPoints
        this.duration = duration
        this.distance = distance
        this.climb = climb
        this.startLat = startLat
        this.startLng = startLng
        this.kmh = kmh
        this.minkm = minkm
        this.geoPoints = geoPoints
    }

    var heartRateAtTrackPoint = function(trackPoint) {
        if (trackPoint.HeartRateBpm === undefined) {
            return "" // not all devices supply heart rate info, return empty string in that case
        }
        return trackPoint.HeartRateBpm.Value
    }

    var createDataPoint = function(tcxPoint, startTime, totalClimb, totalDistance, previousPoint) {
        var point = {
            timeStamp: tcxPoint.Time,
            altitude: tcxPoint.AltitudeMeters,
            distance: tcxPoint.DistanceMeters,
            duration: utils.runTimeAsString(startTime, tcxPoint.Time),
            kmh: 0,
            minkm: 0,
            climb: totalClimb,
            heartRate: heartRateAtTrackPoint(tcxPoint),
            percentage: utils.percentageRun(tcxPoint.DistanceMeters, totalDistance),
        }
        if (previousPoint !== undefined) {
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

    var getStartLatLon = function(laps) {
        var lap = laps[0] // assumes laps are used, todo: don't assume.
        var firstTrackPoint = lap.Track.Trackpoint[0]
        return {
            lat: parseFloat(firstTrackPoint.Position.LatitudeDegrees),
            lng: parseFloat(firstTrackPoint.Position.LongitudeDegrees)
        }
    }

    var getTotalDistance = function(laps) {
        // Could just get the last DistanceMeters value, but there are
        // cases where DistanceMeters zeroes during the run. So this gets
        // last non-zero value.
        for (i = laps.length; i > 0; i--) {
            var lap = laps[i-1]
            for (j = lap.Track.Trackpoint.length; j > 0; j--) {
                var trackPoint = lap.Track.Trackpoint[j-1]
                if (parseFloat(trackPoint.DistanceMeters) > 0) {
                    return Math.round(trackPoint.DistanceMeters * 100) / 100
                }
            }
        }
        return 0
    }

    var getStartTime = function(laps) {
        return laps[0].Track.Trackpoint[0].Time
    }

    var getEndTime = function(dataPoints) {
        return dataPoints[dataPoints.length-1].timeStamp
    }

    var objectToArray = function(object) {
        if (!Array.isArray(object)) {
            var array = []
            array.push(object)
            return array
        }
        return object
    }

    var processJson = function(json) {
        var laps = objectToArray(json.TrainingCenterDatabase.Activities.Activity.Lap)
        var dataPoints = []
        var geoPoints = []
        var lastAltitudeReading
        var previousPoint
        var totalClimb = 0
        var totalDistance = getTotalDistance(laps)
        var startTime = getStartTime(laps)

        laps.forEach(function(lap) {
            var trackPoints = objectToArray(lap.Track.Trackpoint)
            trackPoints.forEach(function(trackPoint) {
                if (trackPoint.Position !== undefined) {
                    // Only create data points if there is lat/lon information available
                    totalClimb += utils.climbSinceLastPoint(trackPoint.AltitudeMeters, lastAltitudeReading)
                    lastAltitudeReading = parseFloat(trackPoint.AltitudeMeters)
                    var point = createDataPoint(trackPoint, startTime, totalClimb, totalDistance, previousPoint)
                    dataPoints.push(point)
                    var geoPoint = createGeoPoint(trackPoint)
                    geoPoints.push(geoPoint)
                    previousPoint = point
                }
            })
        })

        var endTime = getEndTime(dataPoints)
        var startLatLon = getStartLatLon(laps)
        return new route(
            startTime,
            json.TrainingCenterDatabase.Activities.Activity.Creator.Name,
            dataPoints,
            utils.runTimeAsString(startTime, endTime),
            totalDistance,
            totalClimb,
            startLatLon.lat,
            startLatLon.lng,
            utils.kmh(totalDistance, utils.durationInHours(startTime, endTime)),
            utils.minkm(totalDistance, utils.durationInMinutes(startTime, endTime)),
            geoPoints
        )
    }

    return new Promise(function(resolve, reject) {
        xml2js.parseStringAsync(data, { explicitArray: false, ignoreAttrs: true })
            .then(function (result) {
                var route = processJson(result)
                return resolve(route)
            })
            .catch(function (err) {
                console.log(err)
                return reject()
            })
    })
}