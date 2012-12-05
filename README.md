chat-transalation
=================

You can host this on your ip but have to manually enter your ip into the index.html and chatServer.js files.  I couldn't come up with a better way to do this.  I'd love to manually grab your ip and load that in but not sure now.

You can do this with anyone on your network or host on a public ip.  Everyone connects to the servers ip and port 5000. 
run node chatServer.js to get the server started.

enter in your name and then click on your buddies name in the buddy list.
a chat window pops up and you type in the bottom window.  
whatever you type gets translated into spanish using bing's api and sent to your buddies chat window.

super easy low hanging fruit to add but i don't care enough to add.
add a box to specify what language you are typing in and have bing translate from that language to the language of your buddy

this is a super raw first implementation just as a proof of concept.  i also have my bing credentials hard coded into the app right now but am too lazy to properly load from a config file.  please don't use them.

there's also some commented out code that sends whatever you say to a sinatra server that will speak your buddies chats but i had some encoding issues which again i was too lazy to fix.