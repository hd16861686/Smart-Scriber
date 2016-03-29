angular.module("SmartScribe.controllers", [])
.controller('MainCtrl', ["$scope", "LicodeService", function($scope, LicodeService){
	$scope.testMessage = "good to go";
}]);