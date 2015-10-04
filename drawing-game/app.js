// Including libraries
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// This is the port for our web server.
// you will need to go to http://localhost:8080 to see it
server.listen(3000);

app.use('/assets', express.static('assets'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Delete this row if you want to see debug messages
io.set('log level', 1);

// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) {

	// Start listening for mouse move events
	socket.on('mousemove', function (data) {
		
		// This line sends the event (broadcasts it)
		// to everyone except the originating client.
		socket.broadcast.emit('moving', data);
	});
});
