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
        $scope.route = response.data;
        console.log($scope.route);
    }

    $scope.init = function() {
        RouteService.getAll(
            function successCallback(response) {
                updateRoutes(response);
                $scope.status = {text : "Route deleted successfully."};
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

kastor.controller('mapController', [function(NgMap){
    NgMap.getMap().then(function(map) {
        console.log(map.getCenter());
        console.log('markers', map.markers);
        console.log('shapes', map.shapes);
    });
}]);