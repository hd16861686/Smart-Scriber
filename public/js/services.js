var disableRecognition = false;
angular.module("SmartScribe.services", [])
.service('LicodeService', ["$http", "$rootScope", "SpeechRecognition", function($http, $rootScope, SpeechRecognition){
	var serverUrl = "/";
	var localStream;
	var myVideoId = "my-video";
	var clientUsername;
	var streamConfig = {
		audio : true,
		video : false,
		data : true,
		videoSize: [640, 360, 640, 360]
	};

	/**
	 * Send data to clients subscribed to you
	 * @param {object} data
	 */
	function sendData(data) {
		// make sure client local stream is connected to room first
		if(localStream.stream) {
			localStream.sendData(data);
		}
	};

	/**
	 * Configs the local stream event listeners
	 * @param {object} room Requires a ErizoRoom object
	 */
	function configLocalStream(room){
		if(!room) {
			throw new Error("No Room to initialize local stream in");
		}
		/**
		 * Subscribe to all streams in the room except your own
		 * @param {array} streams
		 */
		function subscribeToStreams(streams) {
	    for (var index in streams) {
	      var stream = streams[index];
	      if (localStream.getID() !== stream.getID()) {

	        room.subscribe(stream);
	        // attach a listener for stream broadcast
					stream.addEventListener("stream-data", function(e) {
						// console.log("new data sent by " + e.stream.getID(), e);
						$rootScope.$emit("appendTranscript", e.msg);
					});
	      }
	    }
	  };
		localStream = Erizo.Stream(streamConfig);
		/**
		 * Event listener for when user enables mic + video access
		 */
		localStream.addEventListener("access-accepted", function(){
			speechEvents = hark(localStream.stream, {});
	    speechEvents.on('stopped_speaking', function(){
	    	console.log("stopped speaking");
	    	$rootScope.$emit('stoppedSpeaking');
	    });

	    // starts speech recognition after user has enabled media access
	    SpeechRecognition.toggleRecognition(true);

			/**
			 * When the local user has connected to the room successfully
			 * publish your room so everyone can find your stream
			 */
			room.addEventListener("room-connected", function(roomEvent){
				room.publish(localStream, {maxVideoBW: 300});
				subscribeToStreams(roomEvent.streams);
			});

			/**
			 * When you have successfully subscribed to a stream, this fn is called
			 */
			room.addEventListener("stream-subscribed", function(streamEvent){
				var stream = streamEvent.stream;
				$rootScope.$emit("streamUpdate", stream, true);
			});

			/**
			 * When another stream is added to the room 
			 */
			room.addEventListener("stream-added", function(streamEvent){
				var stream = streamEvent.stream;
				// check if stream that was added is client's
				if(localStream.getID() === stream.getID()){
					console.log("Successfully Published");
				} else {
					var streamArray = [stream];
					subscribeToStreams(streamArray);

				}
			});

			/**
			 * When a stream no longer exists in the room
			 */
			room.addEventListener("stream-removed", function(streamEvent){
				var stream = streamEvent.stream;
				$rootScope.$emit("streamUpdate", stream, false);
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
		clientUsername = userName;
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


	/**
	 * Gets or creates a room by passing room and name
	 * Server returns token for that room
	 * @param {string} room
	 * @param {string} userName
	 * @returns {boolean}
	 */
	this.joinRoomWithName = function(room, userName, next, error){
		try {
			createToken(room, userName, function(response){
				var token = response.data;
				room = Erizo.Room({token : token});
				try {
					configLocalStream(room);
					localStream.init();
					next();
				} catch (err){
					error(err);
				}
			}, error);
		} catch(err) {
			error(err);
			
		}
		
	};

	/**
	 * Wrap the necessary meta data around a transcript before sending
	 * @param {string} transcript
	 */
	$rootScope.$on("broadcastTranscript", function(e, transcript){
		if(!clientUsername) {
			return;
		}
		var transcriptObject = {
			name : clientUsername,
			time : new Date(),
			message : transcript
		};
		sendData(transcriptObject);
		$rootScope.$emit("appendTranscript", transcriptObject);
	});
	

}])
.service("SpeechRecognition", ["$rootScope", function($rootScope){
	
	var recognition = new webkitSpeechRecognition();
	var finalTranscript = '';
	var self = this;
	recognition.lang = "en-US";
	// .continuous prevents speech recognition from stopping after the user stops speaking
	recognition.continuous = true;
	// .interimResults allows the speech to change eventually
	recognition.interimResults = true;
	
	/**
	 * Send final transcript if there is content
	 */
	function sendFinalTranscript() {
		if(finalTranscript.length > 0) {
			finalTranscript = finalTranscript.trim();
			// console.log(finalTranscript);
			$rootScope.$emit("broadcastTranscript", finalTranscript);
			finalTranscript = '';
		}
	}
	
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
		var interimTranscript = '';

    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    sendFinalTranscript();
   
	};

	recognition.onerror = function(event) {
		console.log("Speech Recognition Error: ", event);
	};

	/**
	 * Recognition has stopped, restart the recognition
	 */
	recognition.onend = function() {
		// console.log("speech recognition stopped, restarting..");
		self.toggleRecognition(true);
	};


	/**
	 * Turns on or off speech recognition
	 * @param {bool} start
	 */
	this.toggleRecognition = function(start){
		if(disableRecognition) {
			return;
		}
		if(start) {
			recognition.start();
		} else {
			recognition.stop();
		}
	};

	$rootScope.$on('stoppedSpeaking', function(){
		self.toggleRecognition(false);
	});

}]);