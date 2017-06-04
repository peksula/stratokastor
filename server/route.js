var utils = require('./utils')
var jsUtils = require('./jsUtils')
var Promise = require("bluebird")

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

exports.route = function (laps, device) {
    var dataPoints = []
    var geoPoints = []
    var totalClimb = 0
    var totalDistance = getTotalDistance(laps)
    var startTime = getStartTime(laps)
    var lastAltitudeReading
    var previousPoint

    laps.forEach(function(lap) {
        var trackPoints = jsUtils.objectToArray(lap.Track.Trackpoint)
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
    this.kmh = utils.kmh(totalDistance, utils.durationInHours(startTime, endTime))
    this.minkm = utils.minkm(totalDistance, utils.durationInMinutes(startTime, endTime))
    this.startLat = getStartLatLon(laps).lat
    this.startLng = getStartLatLon(laps).lng
            
    this.startTime = startTime
    this.device = device
    this.dataPoints = dataPoints
    this.duration = utils.runTimeAsString(startTime, endTime)
    this.distance = getTotalDistance(laps)
    this.climb = totalClimb
    this.geoPoints = geoPoints
}