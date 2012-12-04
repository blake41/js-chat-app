var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , request = require('request')
  , translate = require('./translate.js');

var port = process.env.PORT || 5000;
console.log("Listening on " + port);
 
app.listen(port, "192.168.1.75");

var handler = function (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}
var speakMessage = function(message) {
  var formattedMessage = message.text.replace(/ /g, "_"),
    encodedMessage = escape(message.text),
    url = "http://" + senderIP + ":4567/say/" + encodedMessage + "";
  // need to figure out what encoding i'm getting back from bing and fix the escaping
  request.get({
    url : url,
  }, function(error) {
    console.log(error);
  })   
}

var setUsername = function(msg) {
  if(msg.type == "setUsername"){
    users[msg.user] = {
      clientId :client.id,
      clientIP : client.handshake.address.address
    }
    redis3.sadd("onlineUsers",msg.user);
    client.broadcast.emit("updateBuddyList", msg.user)
    redis3.smembers("onlineUsers", function(err, members) {
      client.emit("newBuddyList", members)        
    })
  }
}
var translateAndSend = function(message) {
  var socketId = users[message.to]['clientId']
  var senderIP = users[message.to]['clientIP']
  translatedText = translate(message.text)
  message.text = translatedText
  io.sockets.socket(socketId).emit("privateMessage", message)
  sayMessage(message)     
}
var redis1 = require("redis").createClient();
var redis2 = require("redis").createClient();
var redis3 = require("redis").createClient();
redis3.del("onlineUsers")

var users = {}
io.sockets.on('connection', function (client) {
	redis1.subscribe("emrchat");
// 3. redis 1 gets the message event because it's subscribed
// we have 3 instances of client and each time we initiate one we create another callback on 1 instance of
// redis 1.  so we have an array of callbacks for the message event like [clien1.send, client2.send, clienti.send]

// 1. the html form sends a message via the socket and here's our callback
    client.on('message', setUsername);
    client.on("privateMessage", translateAndSend)
    client.on('disconnect', function() {
        redis1.quit();
        redis2.publish("emrchat","User is disconnected : " + client.id);
    });
});