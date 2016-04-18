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
				scope.$emit("updateVideosContainer");
			});
			scope.$on('$destroy', function(){
				scope.$emit("updateVideosContainer");
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
			scope.formattedTime = moment(time).format('h:mm:ss a');
			scope.$emit("updateScroll");
		}
	}
})
.directive('videosContainer', function($window, $timeout){
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var timer;
			var containerDims;
			var numParticipants = element.children().length;
			scope.videoDimensions = {};
			/**
			 * Sets the current dimensions 
			 */
			function setDimensions() {

				containerDims = {
					width: element[0].offsetWidth,
					height: element[0].offsetHeight
				};
				calculateInnerDimensions();
			}

			/**
			 * Calculate the best size to fit the elements 
			 * in the container while maintaing 16:9 ratio
			 */
			function calculateInnerDimensions() {
				var videoDimensions = scope.videoDimensions;
				videoDimensions.width = containerDims.width;
				videoDimensions.height = containerDims.height;
				var currentRatio = containerDims.width/containerDims.height;
				switch(numParticipants) {
					case 2:
						if(currentRatio > (16*2/9)) {
							videoDimensions.width = 16*videoDimensions.height/9;
						} else {
							videoDimensions.width = videoDimensions.width/2;
							videoDimensions.height =  (9/16) * videoDimensions.width;
							
						}
					
						break;
					case 5:
					case 6:
						if(currentRatio > (16*2/9)*(3/2)) {
							videoDimensions.height = videoDimensions.height/2;
							videoDimensions.width = 16*videoDimensions.height/9;
						} else {
							videoDimensions.width = videoDimensions.width/3;
							videoDimensions.height = (9/16) * videoDimensions.width;
						}
						break;
					default:
						// current doc dims are wider than 16:9, use height to constrain
						if(currentRatio > 16/9) {
							videoDimensions.width = 16*videoDimensions.height/9;
						} else {
							videoDimensions.height = 9*videoDimensions.width/16;
						}
						if(numParticipants > 6){
							videoDimensions.width = videoDimensions.width/3;
							videoDimensions.height = videoDimensions.height/3;
						} else if(numParticipants === 3 || numParticipants === 4) {
							videoDimensions.width = videoDimensions.width/2;
							videoDimensions.height = videoDimensions.height/2;
						}
				}
			};

			
			angular.element($window).bind("resize", function(){
				if(timer){
					$timeout.cancel(timer);
				}
				timer = $timeout(setDimensions, 250);
			});
			scope.$on("updateVideosContainer", function(){
				$timeout(function(){
					numParticipants = element.children().length;
					calculateInnerDimensions();
				});
			});

			$timeout(function(){
				setDimensions();
			});
		}
	}
})
.directive('autoScroll', function(){
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			console.log(element);
		}
	}
});