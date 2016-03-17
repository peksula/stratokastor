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
        $scope.editorEnabled = false;
        $scope.playbackToggled = false;
        $scope.playbackMultiplier = 1;
        $scope.route = angular.fromJson(response.data);
        $scope.mapPosition = {
            lat: $scope.route.data.startLat,
            lng: $scope.route.data.startLng,
            zoom: 16
        };
        
        var firstTimeStamp = $scope.route.data.dataPoints[0].timeStamp;
        var lastTimeStamp = $scope.route.data.dataPoints[$scope.route.data.dataPoints.length-1].timeStamp;
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
        $scope.playbackToggled = false;
        
        RouteService.getAll(
            function successCallback(response) {
                refreshRoutes(response);
                if ($scope.routes.length > 0) {
                    // Show the details of the first route
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
    };
    
    $scope.cancelEdit = function(id) {
        $scope.editorEnabled = false;
        if (id !== undefined) {
            // Reload original data to control from backend.
            // TODO: Because this also switches to stopped state: save original data to memory and restore from there
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
    
    var reset = function() {
        if (timer !== undefined) {
            $timeout.cancel(timer);
        }
        $scope.$parent.playbackToggled = false;
        $scope.cursor = {
            duration: "",
            distance: "",
            velocity: "",
            speed: "",
            climb: "",
            altitude: "",
            bpm: "",
            percentage: ""
        };
    }
    
    $scope.setAnimationSpeed = function(speed) {
        $scope.$parent.playbackMultiplier = speed;
    }

    $scope.playRoute = function() {
        reset();
        $scope.$parent.playbackToggled = true;
        var i = 0;
        
        var step = function() {
            var currentVelocity = 0;
            var currentSpeed = 0;
            if (i > 0) {
                var previousTimeStamp = $scope.route.data.dataPoints[i-1].timeStamp;
                var currentTimeStamp = $scope.route.data.dataPoints[i].timeStamp;
                var previousDistance = $scope.route.data.dataPoints[i-1].distance;
                var currentDistance = $scope.route.data.dataPoints[i].distance;
                var timeInHours = TimeAndSpace.runTimeInHours(previousTimeStamp, currentTimeStamp); 
                var kilometersSinceLastPoint = TimeAndSpace.lengthInKilometers(currentDistance - previousDistance);
                currentVelocity = kilometersSinceLastPoint / timeInHours; // todo move to server
                var timeInMins = TimeAndSpace.runTimeInMins(previousTimeStamp, currentTimeStamp);
                currentSpeed = timeInMins / TimeAndSpace.lengthInKilometers(currentDistance - previousDistance); // todo move to server
            }
            $scope.cursor = {
                duration: $scope.route.data.dataPoints[i].duration,
                distance: $scope.route.data.dataPoints[i].distance,
                velocity: currentVelocity,
                speed: currentSpeed,
                climb: $scope.route.data.dataPoints[i].climb,
                altitude: $scope.route.data.dataPoints[i].altitude,
                bpm: $scope.route.data.dataPoints[i].heartRate,
                percentage: $scope.route.data.dataPoints[i].percentage
            };
            
            stepMap($scope.route.data.dataPoints[i].percentage);
            
            i++;
            if (i < $scope.route.data.dataPoints.length) {
                var currentTimeStamp = $scope.route.data.dataPoints[i-1].timeStamp;
                var nextTimeStamp = $scope.route.data.dataPoints[i].timeStamp;
                var delay = TimeAndSpace.millisecondsToNextPoint(currentTimeStamp, nextTimeStamp);
                delay = delay / $scope.$parent.playbackMultiplier;
                timer = $timeout(step, delay);
            }
        }
        
        timer = $timeout(step, 250);
	};
    
    $scope.stopRoute = function() {
        reset();
    };

});