angular.module("SmartScribe.controllers", [])
.controller('MainCtrl', ["$scope", "LicodeService", function($scope, LicodeService){
	$scope.isChrome = true;
	if(!("webkitSpeechRecognition" in window)) {
		$scope.isChrome = false;
	}

}]);