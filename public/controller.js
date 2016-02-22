var kastor = angular.module('kastor', ['ngMap']);

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
    
kastor.controller('mainController', ['$scope', 'RouteService', function($scope, RouteService){
    var refreshRoutes = function(response) {
        $scope.routes = response.data;
        console.log($scope.routes);
    }
    
    var refreshRoute = function(response) {
        $scope.route = angular.fromJson(response.data);
        $scope.mapPosition = {
            lat: $scope.route.data.startLat,
            lng: $scope.route.data.startLng,
            zoom: 15
        };
        console.log($scope.route);
    }

    $scope.init = function() {
        $scope.mapPosition = {
            lat: 60.6333,
            lng: 24.8500,
            zoom: 8
        };
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
/*
kastor.controller('routeAnimationController', function(NgMap, $scope, $interval, $timeout) {
    var vm = this;
    var count = 0;
    var _timeout = 200;
    
    NgMap.getMap().then(function(map) {
        var shape = map.shapes.routeShape;
        
        var step = function() {
            count = (count + 1) % 200;
            var icons = shape.get('icons');
            icons[0].offset = (count / 2) + '%';
            shape.set('icons', icons);
            _timeout = _timeout +1;
            //$timeout(step, _timeout);
            $timeout(step, 200);
        }
        
        $timeout(step, 200);
    });

});
*/

kastor.controller('routeVisualizationController', function(NgMap, $scope, $timeout) {
    var vc = this;
    var timer;
    var map;
    var shape;
    
    $scope.initMap = function() {
        NgMap.getMap().then(function(_map) {
            map = _map;
            shape = map.shapes.routeShape;
        });
    };
    
    var percentageRun = function (currentDistance, totalDistance) {
        return currentDistance/totalDistance*100;
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
            $scope.cursor = {
                duration: $scope.route.data.trackPoints[i].duration,
                distance: $scope.route.data.trackPoints[i].distance,
                climb: $scope.route.data.trackPoints[i].climb,
                altitude: $scope.route.data.trackPoints[i].altitude,
                bpm: $scope.route.data.trackPoints[i].heartRate,
                lat: $scope.route.data.trackPoints[i].lat,
                lng: $scope.route.data.trackPoints[i].lng
            };
            
            stepMap(percentageRun($scope.route.data.trackPoints[i].distance), $scope.route.totalDuration);
            
            i++;
            if (i < trackpointCount) {
                timer = $timeout(step, 1000);
            }
        }
        
        timer = $timeout(step, 1000);
	};
    
    $scope.stopRoute = function() {
        if (timer !== undefined) {
            $timeout.cancel(timer);
        }
    };        

});