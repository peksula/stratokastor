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
    var updateRoutes = function(response) {
        $scope.routes = response.data;
        console.log($scope.routes);
    }
    
    var updateRoute = function(response) {
        $scope.route = angular.fromJson(response.data);
        console.log($scope.route);
    }

    $scope.init = function() {
        RouteService.getAll(
            function successCallback(response) {
                updateRoutes(response);
                $scope.status = {text : "Routes loaded successfully."};
             },
            function errorCallback(response) {
                console.log("Failed to load routes. %s.", response);
                $scope.status = {text : "Failed to load routes."};
            }
        );
    };

    $scope.showRoute = function(id) {
        RouteService.get(
            id,
            function successCallback(response) {
                updateRoute(response);
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
                updateRoutes(response);
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
                updateRoute(response);
                $scope.status = {text : "Route updated successfully."};
             },
            function errorCallback(response) {
                console.log("Failed to update the route. %s.", response);
                $scope.status = {text : "Failed to update the route."};
            }
        );
    };
    
}]);

kastor.controller('routeAnimationController', function(NgMap, $scope, $interval, $timeout) {
    var vm = this;
    var count = 0;
    var _timeout = 20;
    
    NgMap.getMap().then(function(map) {
        var shape = map.shapes.routeShape;
        
        var step = function() {
            count = (count + 1) % 200;
            var icons = shape.get('icons');
            icons[0].offset = (count / 2) + '%';
            shape.set('icons', icons);
            _timeout = _timeout +1;
            //$timeout(step, _timeout);
            $timeout(step, 20);
        }
        
        $timeout(step, 20);
    });

});