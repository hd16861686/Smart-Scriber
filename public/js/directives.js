angular.module("SmartScribe.directives", [])
.directive("meetingCreator", ['LicodeService', function(LicodeService){
	return {
		restrict: 'A',
		templateUrl: '../templates/meeting-creator.html',
		link: function(scope, element, attrs) {
			scope.meetingInfo = {};
			scope.joinRoom = function(){
				var meetingInfo = scope.meetingInfo;
				var roomJoinSuccess = LicodeService.joinRoomWithName(meetingInfo.roomName, meetingInfo.userName);
				if(roomJoinSuccess) {
					scope.roomJoined = true;
				} else {
					console.log("Error: Failed to join room");
				}
			}
		}
	}
}])
.directive('participant', function(){
	return {
		restrict : "A",
		templateUrl : '../templates/participant.html',
		link: function(scope, element, attrs) {
			scope.streamID = scope.stream.getID();
		}
	}
});