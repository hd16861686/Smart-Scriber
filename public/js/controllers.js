angular.module("SmartScribe.controllers", [])
.controller('MainCtrl', ["$scope", "$rootScope", "LicodeService", "SpeechRecognition", function($scope, $rootScope, LicodeService, SpeechRecognition){
	$scope.isChrome = true;
	$scope.roomJoined = false;
	if(!("webkitSpeechRecognition" in window)) {
		$scope.isChrome = false;
	}

}]);