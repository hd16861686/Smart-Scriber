angular.module("SmartScribe.directives", [])
.directive("meetingCreator", ['LicodeService', function(LicodeService){
	return {
		restrict: 'A',
		templateUrl: '../templates/meeting-creator.html',
		link: function(scope, element, attrs) {
			scope.meetingInfo = {};
			scope.joinRoom = function(){
				var meetingInfo = scope.meetingInfo;
				LicodeService.joinRoomWithName(meetingInfo.roomName, meetingInfo.userName, function(data){
					scope.roomJoined = true;
				}, function(err){
					console.log("Error: " + err);
				});
				
			}
		}
	}
}])
.directive('participant', function($timeout){
	return {
		restrict : "A",
		templateUrl : '../templates/participant.html',
		link: function(scope, element, attrs) {
			// var stream = scope.stream;
			// scope.participantID = stream.getID();
			

			/**
			 * Render of new participant object complete
			 */
			$timeout(function(){
				// Play the stream when participant element is created
				scope.stream.play(scope.streamID);
			});
			
		}
	}
})
.directive('transcript', function(){
	return {
		restrict : "A",
		templateUrl: "../templates/transcript.html",
		link: function(scope, element, attrs) {
			var time = scope.transcript.time;
		}
	}
});