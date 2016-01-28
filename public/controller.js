var kastor = angular.module('kastor', []);

kastor.service('RouteService', ['$http', function($http){

/*    this.getAll = function(successCallback, errorCallback) {
        $http({
            method: 'GET',
            url: '/routes'
        }).then(successCallback(response), errorCallback(response))
    };*/

    this.getAll = function(successCallback, errorCallback) {
        $http({
            method: 'GET',
            url: '/routes'
        }).then(successCallback, errorCallback);
    };

    this.get = function(id) {
        $http({
            method: 'GET',
            url: '/routes/' + id
        }).then(function successCallback(response) {
            return {
                data: response,
                statusText: "Route loaded successfully."
            };
        }, function errorCallback(response) {
            return {
                statusText: "Loading of the route failed. "  + response
            };
        });        
    };

    this.update = function(id, title, comment, weather) {
        $http({
            method: 'POST',
            url: '/routes/' + id,
            data: {
                title: title,
                comment: comment,
                weather: weather
                }
        }).then(function successCallback(response) {
            return {
                data: response,
                statusText: "Route updated successfully."
            };
        }, function errorCallback(response) {
            return {
                statusText: "Updating of the route failed. " + response
            };
        });        
    };
    
    this.delete = function(id) {
        $http({
            method: 'DELETE',
            url: '/routes/' + id,
        }).then(function successCallback(response) {
            return {
                data: response,
                statusText: "Route deleted successfully."
            };
        }, function errorCallback(response) {
            return {
                statusText: "Deleting the route failed. " + response
            };
        });        
    };
}]);    
    
kastor.controller('mainController', ['$scope', 'RouteService', function($scope, RouteService){

    RouteService.getAll(
        function successCallback(response) {
            $scope.routes = response.data;
            $scope.status = { text : "Routes loaded successfully."};
            },
        function errorCallback(response) {
            $scope.status = {text : "Failed to load routes."};
            }
        );

    $scope.showRoute = function(id) {
        var response = RouteService.get(id);
        $scope.route = response.data;
        $scope.status.text = response.statusText;
	};    

    $scope.deleteRoute = function(id) {
        var response = RouteService.delete(id);
        $scope.routes = response.data;
        $scope.status.text = response.statusText;
	};
    
    $scope.updateRoute = function(id){
        var response = RouteService.update(id, $scope.route.title, $scope.route.comment, $scope.route.weather);
        $scope.route = response.data;
        $scope.status.text = response.statusText;
    };

}]);