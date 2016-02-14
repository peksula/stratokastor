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
                $scope.status = {text : "Route loaded successfully."};
             },
            function errorCallback(response) {
                $scope.status = {text : "Failed to load the route."};
            }
        );
	};    

    $scope.deleteRoute = function(id) {
        RouteService.del(
            id,
            function successCallback(response) {
                refreshRoutes(response);
                $scope.route = "";
                $scope.status = {text : "Route deleted successfully."};
             },
            function errorCallback(response) {
                console.log("Failed to delete the route. %s.", response);
                $scope.status = {text : "Failed to delete the route."};
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

kastor.controller('routeVisualizationController', function(NgMap, $scope, $interval, $timeout) {
    var vc = this;
    
    NgMap.getMap().then(function(map) {
        var shape = map.shapes.routeShape;
        var trackpointCount = $scope.route.data.trackPoints.length;
        var i = 0;
        
        var step = function() {
            $scope.cursor = {
                altitide: $scope.route.data.trackPoints[i].altitude,
                bpm: $scope.route.data.trackPoints[i].heartRate
            };
            i++;
            i = i % trackpointCount;
            $timeout(step, 200);
        }
        
        $timeout(step, 200);
    });

});