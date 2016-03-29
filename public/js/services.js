angular.module("SmartScribe.services", [])
.service('LicodeService', function($http){
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
	function configLocalStream = function(room){
		if(!room) {
			throw new Error("No Room to initialize local stream in");
		}
		localStream = Erizo.Stream(streamConfig);
		/**
		 * Event listener for when user enables mic + video access
		 */
		localStream.addEventListener("access-accepted", function(){
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
	var createToken = function(username, role, callback, err) {
		var body = {username : username, role : role};
		$http({
			method : "POST",
			url : serverUrl + "createToken/",
			headers: {
				'Content-Type' : 'application/json'
			},
			data: body
		}).then(callback, err);

	}
	createToken("user", "presenter", function(response){
		var token = response.data;
		room = Erizo.Room({token : token});
		try {
			initLocalStream(room);
			localStream.init();
		} catch (err){
			console.log("Error: " + err);
		}
	}, function(err){
		console.log("Could not create token : ", err);
	});

});