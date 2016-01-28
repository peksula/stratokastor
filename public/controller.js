var kastor = angular.module('kastor', []);

kastor.service('RouteService', ['$http', function(){
    this.routeHello = function(){
        return "Hello from RouteService.";
    };
    
    this.getRoute = function(id) {
        $http({
            method: 'GET',
            url: '/routes/' + id
        }).then(function successCallback(response) {
            return response;
        }, function errorCallback(response) {
            console.log('Error: ' + response);
            return response;
        });        
    };
}]);    
    
kastor.controller('mainController', ['$scope', '$http', 'RouteService', function($scope, $http, RouteService){
  //$scope.test = RouteService.routeHello();

    $http.get('/routes')
        .success(function(data) {
            console.log('Data: ' + data);
            $scope.routes = data;
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    
    $scope.showRoute = function(id) {
        $scope.route = RouteService.getRoute();
        /*
        $http.get('/routes/' + id)
            .success(function(data) {
                $scope.route = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });*/
	};    

    $scope.deleteRoute = function(id) {
		$http.delete('/routes/' + id)
			.success(function(data) { // TODO: Success and Error have been deprecated
				$scope.routes = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};
    
    $scope.updateRoute = function(id){
        $http({
            method: 'PUT',
            url: '/routes/' + id,
            data: { "title": 'hardcoded' }
        }).then(function successCallback(response) {
            $scope.route = response;
        }, function errorCallback(response) {
            console.log('Error: ' + response);
        });        
        /*
        var data = {
            title: "hardcoded",
            comment: $scope.route.comment
        }*/
    };
    
    

}]);