angular.module("SmartScribe.controllers", [])
.controller('MainCtrl', ["$scope", "LicodeService", "SpeechRecognition", function($scope, LicodeService, SpeechRecognition){
	$scope.isChrome = true;
	if(!("webkitSpeechRecognition" in window)) {
		$scope.isChrome = false;
	}

}]);