angular.module("SmartScribe.services", [])
.service('LicodeService', ["$http", "$rootScope", "SpeechRecognition", function($http, $rootScope, SpeechRecognition){
	var serverUrl = "/";
	var localStream;
	var myVideoId = "my-video";
	var streamConfig = {
		audio : true,
		video : true,
		data : true,
		videoSize: [640, 480, 640, 480]
	};
	/**
	 * Configs the local stream event listeners
	 * @param {object} room Requires a ErizoRoom object
	 */
	function configLocalStream(room){
		if(!room) {
			throw new Error("No Room to initialize local stream in");
		}
		localStream = Erizo.Stream(streamConfig);
		/**
		 * Event listener for when user enables mic + video access
		 */
		localStream.addEventListener("access-accepted", function(){
			
			/**
			 * Hark determines whether or not the user is currently speaking
			 * will be used to timestamp and send out transcript to group
			 */
			var speechEvents = hark(localStream.stream, {});
	    speechEvents.on('speaking', function(){
	    	$rootScope.$emit("speaking", true);
	    });
	    speechEvents.on('stopped_speaking', function(){
	    	$rootScope.$emit("speaking", false);
	    });

	    // starts speech recognition after user has enabled media access
	    SpeechRecognition.toggleRecognition(true);
// 
			/**
			 * When the local user has connected to the room successfully
			 * publish your room so everyone can find your stream
			 */
			room.addEventListener("room-connected", function(roomEvent){
				room.publish(localStream, {maxVideoBW: 300});
			});

			/**
			 * When you have successfully subscribed to a stream, this fn is called
			 */
			room.addEventListener("stream-subscribed", function(streamEvent){

			});

			/**
			 * When another stream is added to the room 
			 */
			room.addEventListener("stream-added", function(streamEvent){

			});

			/**
			 * When a stream no longer exists in the room
			 */
			room.addEventListener("stream-removed", function(streamEvent){

			});

			/**
			 * When a the client's stream fails
			 */
			room.addEventListener("stream-failed", function(streamEvent){
				room.disconnect();
			});
			room.connect();
			localStream.play(myVideoId);
		});
	};
	
	/**
	 * Generates necessary token to create rooms
	 * this is the entry point before doing anything else
	 * @param {string} username
	 * @param {string} role
	 * @param {function} callback takes on param response
	 * @param {function} err takes one param errResponse
	 */
	var createToken = function(roomName, userName, callback, err) {
		if(!roomName || !userName) {
			throw new Error("Missing room name or user name");
		}
		var body = {roomName: roomName, userName : userName, role : "presenter"};
		$http({
			method : "POST",
			url : serverUrl + "createToken/",
			headers: {
				'Content-Type' : 'application/json'
			},
			data: body
		}).then(callback, err);

	}


	// createToken("myroom", "user", function(response){
	// 	var token = response.data;
	// 	room = Erizo.Room({token : token});
	// 	try {
	// 		configLocalStream(room);
	// 		localStream.init();
	// 	} catch (err){
	// 		console.log("Error: " + err);
	// 	}
	// }, function(err){
	// 	console.log("Could not create token : ", err);
	// });

	/**
	 * Gets or creates a room by passing room and name
	 * Server returns token for that room
	 * @param {string} room
	 * @param {string} userName
	 * @returns {boolean}
	 */
	this.joinRoomWithName = function(room, userName){
		try {
			createToken(room, userName, function(response){
				var token = response.data;
				room = Erizo.Room({token : token});
				try {
					configLocalStream(room);
					localStream.init();
					return true;
				} catch (err){
					console.log("Error: " + err);
				}
			}, function(err){
				console.log("Could not create token : ", err);
				return false;
			});
		} catch(err) {
			console.log("Error joining room: ", err);
		}
		
	};

}])
.service("SpeechRecognition", function($rootScope){
	
	var recognition = new webkitSpeechRecognition();
	var final_transcript = '';
	var self = this;
	recognition.lang = "en-US";
	// .continuous prevents speech recognition from stopping after the user stops speaking
	recognition.continuous = true;
	// .interimResults allows the speech to change eventually
	recognition.interimResults = true;
	/**
	 * The function that gets called after recognition.start()
	 */
	recognition.onstart = function(){
		console.log("recognition started");
	};

	/**
	 * The function that gets called after a result is ready
	 * @param {obj} event
	 */
	recognition.onresult = function(event) {
		var interim_transcript = '';

    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
      console.log(event);
    }
    // console.log(interim_transcript);
	};

	recognition.onerror = function(event) {
		console.log("Speech Recognition Error: ", event);
	};

	/**
	 * Recognition has stopped
	 */
	recognition.onend = function() {
		// console.log("speech recognition stopped, restarting..");
		self.toggleRecognition(true);
	};

	/**
	 * Fired when sound that is recognised by the speech recognition service as speech has been detected.
	 */
	recognition.onspeechstart = function(){
		final_transcript = '';
		console.log("speech start");
	};

	/**
	 * Fired when speech recognised by the speech recognition service has stopped being detected.
	 */
	recognition.onspeechend = function() {
		console.log(final_transcript);
		
	};
	recognition.onaudiostart = function(){
		console.log("HUH WTAT");
	};

	// $rootScope.$on("speaking", function(e, isSpeaking){
	// 	if(isSpeaking){
	// 		// console.log(final_transcript);
	// 	} else {
	// 		// console.log(final_transcript);
	// 		console.log("stop speaking");
	// 		final_transcript = '';

	// 	}
	// });
	/**
	 * Turns on or off speech recognition
	 * @param {bool} start
	 */
	this.toggleRecognition = function(start){
		if(start) {
			recognition.start();
		} else {
			recognition.stop();
		}
	};
});