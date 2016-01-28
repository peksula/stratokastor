var kastor = angular.module('kastor', []);

kastor.service('RouteService', ['$http', function($http){

/*    
    this.getAll = function(successCallback, errorCallback) {
        $http({
            method: 'GET',
            url: '/routes'
        }).then(successCallback, errorCallback);
    };
    */
    this.getAll = function() {
        return $http({
            method: 'GET',
            url: '/routes'
        });
    };

    this.get = function(id) {
        $http({
            method: 'GET',
            url: '/routes/' + id
        }).then(successCallback, errorCallback);
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
    
    this.del = function(id) {
        $http({
            method: 'DELETE',
            url: '/routes/' + id,
        }).then(successCallback, errorCallback)
    };

}]);    
    
kastor.controller('mainController', ['$scope', '$http', 'RouteService', function($scope, $http, RouteService){
/*        function successCallback(response) {
            $scope.$apply(function() {
                $scope.routes = response;
                $scope.status = {text : "Routes loaded successfully."};
            });*/

    $http({
        method: 'GET',
        url: '/routes'
    }).then(
        function(response) {
            $scope.routes = response;
            $scope.status = {text : "Routes loaded successfully."};
        },
        function(response) {
            $scope.status = {text : "Failed to load routes."};
        }
    );

    $scope.showRoute = function(id) {
        RouteService.get(
            id,
            function successCallback(response) {
                $scope.route = response;
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
                $scope.routes = response;
                $scope.status = {text : "Route deleted successfully."};
             },
            function errorCallback(response) {
                $scope.status = {text : "Failed to delete the route."};
            }
        );
	};
    
    $scope.updateRoute = function(id){
        var response = RouteService.update(id, $scope.route.title, $scope.route.comment, $scope.route.weather);
        $scope.route = response.data;
        $scope.status.text = response.statusText;
    };

}]);