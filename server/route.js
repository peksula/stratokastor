var utils = require('./utils')
var jsUtils = require('./jsUtils')
var Promise = require("bluebird")

var getEndTime = function(dataPoints) {
    return dataPoints[dataPoints.length-1].timeStamp
}

exports.route = function (laps, device, converter) {
    
    var self = this
    self.altitude = 0
    self.totalClimb = 0
    self.dataPoints = []
    self.geoPoints = []

    self.getAltitude = function() {
        return self.altitude
    }

    self.setAltitude = function(altitude) {
        self.altitude = altitude
    }

    self.getTotalClimb = function() {
        return self.totalClimb
    }

    self.addToTotalClimb = function(climb) {
        self.totalClimb = self.totalClimb + climb
    }

    self.addDataPoint = function(dataPoint) {
        self.dataPoints.push(dataPoint)
    }

    self.addGeoPoint = function(geoPoint) {
        self.geoPoints.push(geoPoint)
    }

    self.currentDataPoint = function() {
        if (self.dataPoints.length > 0) {
            return self.dataPoints[self.dataPoints.length-1]
        }
        return null
    }
    
    converter.setLaps(laps)
    laps.forEach(function(lap) {
        converter.convertLap(lap, self)
    })

    this.startTime = converter.getStartTime()
    var endTime = getEndTime(self.dataPoints)

    this.climb = self.totalClimb
    this.device = device
    this.duration = utils.runTimeAsString(this.startTime, endTime)
    this.distance = converter.getTotalDistance()
    this.kmh = utils.kmh(this.distance, utils.durationInHours(this.startTime, endTime))
    this.minkm = utils.minkm(this.distance, utils.durationInMinutes(this.startTime, endTime))
    this.startLat = converter.getStartLatLon().lat
    this.startLng = converter.getStartLatLon().lng        
}