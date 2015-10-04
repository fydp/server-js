var thinky = require('thinky')();
var express = require('express');
var http = require('http');
var socketIo = require('socket.io');

// Setup server and Socket.io
var app = express();
var server = http.Server(app);
var io = socketIo(server);

server.listen(3000);

app.use('/assets', express.static('assets'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) {

    // Start listening for mouse move events
    socket.on('mousemove', function (data) {

        // This line sends the event (broadcasts it)
        // to everyone except the originating client.
        socket.broadcast.emit('moving', data);
    });
});

var type = thinky.type;
var r = thinky.r;

// Create models

var Drawing = thinky.createModel('Drawing', {
    id: type.string(),
    createdAt: type.date().default(r.now())
}); 

var Point = thinky.createModel('Point', {
    id: type.string(),
    point: type.point(),
    lineId: type.string(),
    createdAt: type.date().default(r.now())
});

var Line = thinky.createModel('Line', {
    id: type.string(),
    createdAt: type.date().default(r.now()),
    drawingId: type.string()
}); 

Line.hasMany(Point, 'points', 'id', 'lineId');
Drawing.hasMany(Line, 'lines', 'id', 'drawingId');
