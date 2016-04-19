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
.controller('TranscriptCtrl', ['$rootScope', '$timeout', "$scope", "$interval", function($rootScope, $timeout, $scope, $interval){
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
	// $interval(function(){
	// 	if($scope.roomJoined){
	// 		$scope.allTranscripts.push({name:"test", time: new Date(), message:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."});

	// 	}
	// }, 2000)

}]);