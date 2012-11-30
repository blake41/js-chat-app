var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , request = require('request');

var port = process.env.PORT || 5000;
console.log("Listening on " + port);
 
app.listen(port, "10.242.11.250");

function handler (req, res) {
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


var redis1 = require("redis").createClient();
var redis2 = require("redis").createClient();
var redis3 = require("redis").createClient();
redis3.del("onlineUsers")

count = 0;
var users = {}
io.sockets.on('connection', function (client) {
	count++;
	redis1.subscribe("emrchat");
	client.object_id = count
	console.log("client" + count + " created")
// 3. redis 1 gets the message event because it's subscribed
// we have 3 instances of client and each time we initiate one we create another callback on 1 instance of
// redis 1.  so we have an array of callbacks for the message event like [clien1.send, client2.send, clienti.send]
    redis1.on("message", function(channel, message) {
				console.log("callback for client" + client.object_id)
        client.send(message);
    });

// 1. the html form sends a message via the socket and here's our callback
    client.on('message', function(msg) {
		console.log(msg);
		if(msg.type == "chat"){
// 2. the 2nd instance of redis publishes the message
			console.log('redis publish')
			redis2.publish("emrchat",msg.message);	
		}
		else if(msg.type == "setUsername"){
			users[msg.user] = {
				clientId :client.id,
				clientIP : client.handshake.address.address
			}
			console.log(users)
			redis3.sadd("onlineUsers",msg.user);
			client.broadcast.emit("updateBuddyList", msg.user)
			redis3.smembers("onlineUsers", function(err, members) {
				client.emit("newBuddyList", members)				
			})
		}
    });
    client.on("privateMessage", function(message) {
    	console.log(users[message.to])
			var socketId = users[message.to]['clientId']
    	var senderIP = users[message.to]['clientIP']
    	console.log(senderIP)
    	io.sockets.socket(socketId).emit("privateMessage", message)
    	var url = "http://" + senderIP + ":4567/say/" + message.text;
    	request.get({
    		url : url,
  		}, function(error) {
  			console.log(error);
  		})
    })
    client.on('disconnect', function() {
        redis1.quit();
        redis2.publish("emrchat","User is disconnected : " + client.id);
    });
});