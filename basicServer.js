"use strict";

/*global require, __dirname, console*/
var express = require('express'),
bodyParser = require('body-parser'),
errorhandler = require('errorhandler'),
morgan = require('morgan'),
// net = require('net'),
N = require('./nuve'),
fs = require("fs"),
https = require("https"),
config = require('./../../licode_config');

var options = {
  ca: fs.readFileSync("/ccds.design.ssl/ccds_design.ca-bundle"),
  key: fs.readFileSync("/ccds.design.ssl/ccds.design.key"),
  cert: fs.readFileSync("/ccds.design.ssl/ccds_design.crt")
};

var app = express();

// app.configure ya no existe

app.use(errorhandler({
  dumpExceptions: true,
  showStack: true
}));
app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//app.set('views', __dirname + '/../views/');
//disable layout
//app.set("view options", {layout: false});

N.API.init(config.nuve.superserviceID, config.nuve.superserviceKey, 'http://localhost:3000/');


/**
 * Creates a room with roomName and returns the ID
 * @param {string} roomName
 * @return {string} roomId
 */
function createRoomWithName(roomName) {
  N.API.createRoom(roomName, function(roomId) {
    console.log('Created room named "' + roomName + "' with ID '" + roomId);
    return roomId;
  }, function(){
    throw new Error("Could not create room with name: " + roomName);
  });
}

/**
 * Gets the id of the room with roomName
 * if it does not exist, create it
 * @param {string} roomName
 * @return {string} roomId
 */
function getRoomIdWithName(roomName) {
  var roomId;
  N.API.getRooms(function(roomlist) {
    
    var rooms = JSON.parse(roomlist);

    for (var room in rooms) {
      if (rooms[room].name === roomName){
        roomId = rooms[room]._id;
      }
    }

    if (!roomId) {
      try {
        roomId = createRoomWithName(roomName);
        return roomId;
      } catch(err) {
        console.log("Error Creating Room: ", err);
        throw new Error("Could not create a room with name " + roomName);
      } 
    } else {
      return roomId;
    }

  });
};



app.get('/getRooms/', function(req, res) {
  
  N.API.getRooms(function(rooms) {
    res.send(rooms);
  });
});

app.get('/getUsers/:room', function(req, res) {
  
  var room = req.params.room;
  N.API.getUsers(room, function(users) {
    res.send(users);
  });
});

/**
 * Creates a token with the meta provided by the user
 */
app.post('/createToken/', function(req, res) {
  
  var data = req.body,
  roomName = data.room,
  userName = data.userName,
  role = data.role;
  var roomId;
  if(!room || !userName || !role) {
    res.status(400).send({msg: "Missing required fields"});
  }
  try {
    roomId = getRoomIdWithName(roomName);
  } catch(err) {
    res.status(400).send({msg: "Error creating room: " + err});
  }
  
  N.API.createToken(roomId, userName, role, function(token) {
    console.log("New Token Generated: " + token);
    res.status(200).send(token);
  }, function(err){
    res.status(400).send({msg: "Error generating token: " + err});
  });
});


app.use(function(req, res, next) {
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE');
  res.header('Access-Control-Allow-Headers', 'origin, content-type');
  if (req.method == 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
});



app.listen(3001);

var server = https.createServer(options, app);
server.listen(5000);
