angular.module("SmartScribe.controllers", [])
.controller('MainCtrl', ["$timeout", "$scope", "$rootScope", "LicodeService", "SpeechRecognition", function($timeout, $scope, $rootScope, LicodeService, SpeechRecognition){
	$scope.isChrome = true;
	$scope.roomJoined = false;
	$scope.participants = {};
	if(!("webkitSpeechRecognition" in window)) {
		$scope.isChrome = false;
	}
	/**
	 * When there is a new stream or when a stream is removed
	 * @param {object} stream
	 * @param {bool} isAdd
	 */
	$rootScope.$on("streamUpdate", function(e, stream, isAdd){
		$timeout(function(){
			var id = stream.getID();
			if(isAdd) {
				$scope.participants[id] = stream;
			} else {
				delete $scope.participants[id];
			}
		});
		
	});

}])
.controller('TranscriptCtrl', ['$rootScope', '$timeout', "$scope", function($rootScope, $timeout, $scope){
	$scope.allTranscripts = [];
	/**
	 * Add a new transcript to the transcript container
	 * @param {object} transcriptObject
	 */
	$rootScope.$on("appendTranscript", function(e, transcriptObject){
		$timeout(function(){
			$scope.allTranscripts.push(transcriptObject);
		});
	});
}]);