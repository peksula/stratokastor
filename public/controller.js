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
    
kastor.controller('mainController', ['$scope', '$timeout', 'RouteService', function($scope, $timeout, RouteService){
    var refreshRoutes = function(response) {
        $scope.routes = response.data;
        console.log($scope.routes);
    }

    var lengthInKilometers = function(lengthInMeters) {
        return lengthInMeters/1000;
    }    

    var runTimeInHours = function(startTime, endTime) {
        var startDate = new Date(startTime);
        var endDate = new Date(endTime);
        var diffInMilliseconds = endDate.getTime() - startDate.getTime();
        var diffInHours = diffInMilliseconds / 3600000;
        return diffInHours;
    }    
    
    var refreshRoute = function(response) {
        if (timer !== undefined) {
            $timeout.cancel(timer);
        }
        $scope.route = angular.fromJson(response.data);
        $scope.mapPosition = {
            lat: $scope.route.data.startLat,
            lng: $scope.route.data.startLng,
            zoom: 15
        };
        var totalTimeInHours = runTimeInHours($scope.route.data.trackPoints[0].timeStamp, $scope.route.data.trackPoints[$scope.route.data.trackPoints.length-1].timeStamp);
        $scope.totalVelocity = lengthInKilometers($scope.route.data.distance) / totalTimeInHours;
        console.log($scope.route);
    }

    $scope.init = function() {
        $scope.mapPosition = {
            lat: 60.6333,
            lng: 24.8500,
            zoom: 8
        };
        $scope.playbackMultiplier = 1;
        RouteService.getAll(
            function successCallback(response) {
                refreshRoutes(response);
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
            }
        );
	};    

    $scope.deleteRoute = function(id) {
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
}]);

kastor.controller('routeVisualizationController', function(NgMap, $scope, $timeout) {
    var vc = this;
    var map;
    var shape;
    
    $scope.initMap = function() {
        NgMap.getMap().then(function(_map) {
            map = _map;
            shape = map.shapes.routeShape;
        });
    };
    
    var percentageRun = function (currentDistance, totalDistance) {
        var percentage = currentDistance/totalDistance*100;
        console.log("percentage " + percentage + ". Curr: " + currentDistance + ". Total: " + totalDistance);
        return percentage;
    }

    var millisecondsToNextPoint = function (currentTimestamp, nextTimestamp) {
        var startDate = new Date(currentTimestamp);
        var endDate = new Date(nextTimestamp);
        var diffInMilliseconds = endDate.getTime() - startDate.getTime();
        return diffInMilliseconds;
    }
    
    var lengthInKilometers = function(lengthInMeters) {
        return lengthInMeters/1000;
    }    

    // TODO: a service is needed for the utilities
    var runTimeInHours = function(startTime, endTime) {
        var startDate = new Date(startTime);
        var endDate = new Date(endTime);
        var diffInMilliseconds = endDate.getTime() - startDate.getTime();
        var diffInHours = diffInMilliseconds / 3600000;
        return diffInHours;
    }    

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
            if (i > 0) {
                var timeInHours = runTimeInHours($scope.route.data.trackPoints[i-1].timeStamp, $scope.route.data.trackPoints[i].timeStamp);
                var kilometersSinceLastPoint = lengthInKilometers($scope.route.data.trackPoints[i].distance - $scope.route.data.trackPoints[i-1].distance);
                currentVelocity = kilometersSinceLastPoint / timeInHours;
            }
            $scope.cursor = {
                duration: $scope.route.data.trackPoints[i].duration,
                distance: $scope.route.data.trackPoints[i].distance,
                velocity: currentVelocity,
                climb: $scope.route.data.trackPoints[i].climb,
                altitude: $scope.route.data.trackPoints[i].altitude,
                bpm: $scope.route.data.trackPoints[i].heartRate,
                lat: $scope.route.data.trackPoints[i].lat,
                lng: $scope.route.data.trackPoints[i].lng
            };
            
            stepMap(percentageRun($scope.route.data.trackPoints[i].distance, $scope.route.data.distance));
            
            i++;
            if (i < trackpointCount) {
                var delay = millisecondsToNextPoint($scope.route.data.trackPoints[i-1].timeStamp, $scope.route.data.trackPoints[i].timeStamp);
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