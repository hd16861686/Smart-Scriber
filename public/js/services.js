angular.module("SmartScribe.services", [])
.service('LicodeService', function($http){
	var serverUrl = "/";
	var localStream;

	var streamConfig = {
		audio : true,
		video : true,
		data : true,
		videoSize: [640, 480, 640, 480]
	};

	localStream = Erizo.Stream(config);
	/**
	 * Generates necessary token to create rooms
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
		console.log(response);
	}, function(err){
		console.log(err);
	});

});