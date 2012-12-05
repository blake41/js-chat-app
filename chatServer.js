var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , request = require('request')
  , translator = require('./translate.js')
  , port = process.env.PORT || 5000
  , host = process.env.host;

console.log("Listening on " + host + ":" + port);
app.listen(port, host);

function handler(req, res) {
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

var redis = require("redis").createClient();
// clear out any cruft left over in the db
redis.del("onlineUsers")

var users = {}

io.sockets.on('connection', function (client) {
// 1. the html form sends a message via the socket and here's our callback
  client.on('message', function(msg) {
    if(msg.type == "setUsername"){
      users[msg.user] = {
        clientId : client.id,
        clientIP : client.handshake.address.address
      }
      redis.sadd("onlineUsers",msg.user);
      client.broadcast.emit("updateBuddyList", msg.user)
      redis.smembers("onlineUsers", function(err, members) {
        client.emit("newBuddyList", members)        
      })
    }
  });

  client.on("privateMessage", function(message) {
    var socketId = users[message.to]['clientId'],
        senderIP = users[message.to]['clientIP'],
        // set default so expiresOn - Time.now < 0 and we need a new token 
        expiresOn = 0
    
    redis.hgetall("token", function(err, reply) {
      if(reply) {
        var expiresOn = reply.expiresOn,
        accessToken = reply.accessToken
      }
      translator.translate(message.text, expiresOn, accessToken, redis, function(translatedText) {
        client.set("name", message.from)
        message.text = translatedText
        io.sockets.socket(socketId).emit("privateMessage", message)
        // var formattedMessage = message.text.replace(/ /g, "_"),
        //   encodedMessage = escape(message.text),
        //   url = "http://" + senderIP + ":4567/say/" + encodedMessage + "",
        //   getOptions = {
        //     url : url,
        //   }
        // // need to figure out what encoding i'm getting back from bing and fix the escaping
        // request.get(getOptions, function(error) {
        //   console.log(error);
        // })
      })
    })

  })

  client.on('disconnect', function() {
    client.get('name', function(err, name) {
      redis.srem("onlineUsers", name)
    })
  });
});