var kastor = angular.module('kastor', ['ngMap']);
var timer;

kastor.service('RouteService', ['$http', function($http){

    this.getAll = function(successCallback, errorCallback) {
        $http({
            method: 'GET',
            url: '/routes'
        }).then(successCallback, errorCallback);
    };

    this.get = function(id, successCallback, errorCallback) {
        $http({
            method: 'GET',
            url: '/routes/' + id
        }).then(successCallback, errorCallback);
    };

    this.update = function(id, title, comment, weather, successCallback, errorCallback) {
        $http({
            method: 'POST',
            url: '/routes/' + id,
            data: {
                title: title,
                comment: comment,
                weather: weather
                }
        }).then(successCallback, errorCallback);
    };
    
    this.del = function(id, successCallback, errorCallback) {
        $http({
            method: 'DELETE',
            url: '/routes/' + id,
        }).then(successCallback, errorCallback)
    };

}]);

kastor.service('TimeAndSpace', [function(){

    this.lengthInKilometers = function(lengthInMeters) {
        return lengthInMeters/1000;
    }    

    this.millisecondsToNextPoint = function (currentTimestamp, nextTimestamp) {
        var startDate = new Date(currentTimestamp);
        var endDate = new Date(nextTimestamp);
        var diffInMilliseconds = endDate.getTime() - startDate.getTime();
        return diffInMilliseconds;
    }
    
    this.runTimeInHours = function(startTime, endTime) {
        var startDate = new Date(startTime);
        var endDate = new Date(endTime);
        var diffInMilliseconds = endDate.getTime() - startDate.getTime();
        var diffInHours = diffInMilliseconds / 3600000;
        return diffInHours;
    }
    
    this.runTimeInMins = function(startTime, endTime) {
        var startDate = new Date(startTime);
        var endDate = new Date(endTime);
        var diffInMilliseconds = endDate.getTime() - startDate.getTime();
        var diffInMins = diffInMilliseconds / 60000;
        return diffInMins;
    }    
    
    this.percentageRun = function (currentDistance, totalDistance) {
        if (totalDistance === 0) {
            return 0;
        }
        var percentage = currentDistance/totalDistance*100;
        return percentage;
    }

}]);
    
kastor.controller('mainController', ['$scope', '$timeout', 'RouteService', 'TimeAndSpace', function($scope, $timeout, RouteService, TimeAndSpace){
    var refreshRoutes = function(response) {
        $scope.routes = response.data;
        console.log($scope.routes);
    }

    var refreshRoute = function(response) {
        if (timer !== undefined) {
            $timeout.cancel(timer);
        }
        $scope.route = angular.fromJson(response.data);
        $scope.mapPosition = {
            lat: $scope.route.data.startLat,
            lng: $scope.route.data.startLng,
            zoom: 16
        };
        
        var firstTimeStamp = $scope.route.data.trackPoints[0].timeStamp;
        var lastTimeStamp = $scope.route.data.trackPoints[$scope.route.data.trackPoints.length-1].timeStamp;
        var totalTimeInHours = TimeAndSpace.runTimeInHours(firstTimeStamp, lastTimeStamp);
        var totalTimeInMins = TimeAndSpace.runTimeInMins(firstTimeStamp, lastTimeStamp);
        $scope.totalVelocity = TimeAndSpace.lengthInKilometers($scope.route.data.distance) / totalTimeInHours;
        $scope.totalSpeed = totalTimeInMins / TimeAndSpace.lengthInKilometers($scope.route.data.distance);
        console.log($scope.route);
    }

    $scope.init = function() {
        $scope.mapPosition = {
            lat: 60.6333,
            lng: 24.8500,
            zoom: 8
        };
        $scope.playbackMultiplier = 1;
        $scope.editorEnabled = false;
        
        RouteService.getAll(
            function successCallback(response) {
                refreshRoutes(response);
                if ($scope.routes.length > 0) {
                    $scope.showRoute($scope.routes[0]._id);
                }
             },
            function errorCallback(response) {
                console.log("Failed to load routes. %s.", response);
            }
        );
    };

    $scope.showRoute = function(id) {
        RouteService.get(
            id,
            function successCallback(response) {
                refreshRoute(response);
             },
            function errorCallback(response) {
                console.log("Failed to load the route. %s.", response);
            }
        );
	};    

    $scope.deleteRoute = function(id) {
        $scope.editorEnabled = false;
        RouteService.del(
            id,
            function successCallback(response) {
                refreshRoutes(response);
                $scope.route = "";
             },
            function errorCallback(response) {
                console.log("Failed to delete the route. %s.", response);
            }
        );
	};
    
    $scope.updateRoute = function(id){
        $scope.editorEnabled = false;
        RouteService.update(
            id,
            $scope.route.title,
            $scope.route.comment,
            $scope.route.weather,
            function successCallback(response) {
                refreshRoutes(response);
             },
            function errorCallback(response) {
                console.log("Failed to update the route. %s.", response);
            }
        );
    };
    
    $scope.enableEditor = function() {
        $scope.editorEnabled = true;
        //$scope.editableTitle = $scope.title;
    };
    
    $scope.cancelEdit = function(id) {
        $scope.editorEnabled = false;
        if (id !== undefined) {
            $scope.showRoute(id);
        }
    };

}]);

kastor.controller('routeVisualizationController', function(NgMap, $scope, $timeout, TimeAndSpace) {
    var vc = this;
    var shape;
    
    $scope.initMap = function() {
        NgMap.getMap().then(function(map) {
            shape = map.shapes.routeShape;
        });
    };

    var stepMap = function(percentage) {
        var icons = shape.get('icons');
        icons[0].offset = percentage + '%';
        shape.set('icons', icons);
    }

    $scope.playRoute = function() {
        var trackpointCount = $scope.route.data.trackPoints.length;
        var i = 0;
        
        var step = function() {
            var currentVelocity = 0;
            var currentSpeed = 0;
            if (i > 0) {
                var previousTimeStamp = $scope.route.data.trackPoints[i-1].timeStamp;
                var currentTimeStamp = $scope.route.data.trackPoints[i].timeStamp;
                var previousDistance = $scope.route.data.trackPoints[i-1].distance;
                var currentDistance = $scope.route.data.trackPoints[i].distance;
                var timeInHours = TimeAndSpace.runTimeInHours(previousTimeStamp, currentTimeStamp);
                var kilometersSinceLastPoint = TimeAndSpace.lengthInKilometers(currentDistance - previousDistance);
                currentVelocity = kilometersSinceLastPoint / timeInHours;
                var timeInMins = TimeAndSpace.runTimeInMins(previousTimeStamp, currentTimeStamp);
                currentSpeed = timeInMins / TimeAndSpace.lengthInKilometers(currentDistance - previousDistance);
            }
            $scope.cursor = {
                duration: $scope.route.data.trackPoints[i].duration,
                distance: $scope.route.data.trackPoints[i].distance,
                velocity: currentVelocity,
                speed: currentSpeed,
                climb: $scope.route.data.trackPoints[i].climb,
                altitude: $scope.route.data.trackPoints[i].altitude,
                bpm: $scope.route.data.trackPoints[i].heartRate,
                lat: $scope.route.data.trackPoints[i].lat,
                lng: $scope.route.data.trackPoints[i].lng
            };
            
            stepMap(TimeAndSpace.percentageRun(parseFloat($scope.route.data.trackPoints[i].distance), parseFloat($scope.route.data.distance)));
            
            i++;
            if (i < trackpointCount) {
                var currentTimeStamp = $scope.route.data.trackPoints[i-1].timeStamp;
                var nextTimeStamp = $scope.route.data.trackPoints[i].timeStamp;
                var delay = TimeAndSpace.millisecondsToNextPoint(currentTimeStamp, nextTimeStamp);
                delay = delay / $scope.playbackMultiplier;
                timer = $timeout(step, delay);
            }
        }
        
        timer = $timeout(step, 250);
	};
    
    $scope.stopRoute = function() {
        if (timer !== undefined) {
            $timeout.cancel(timer);
        }
    };

});