var body_parser  = require('body-parser');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8080);

app.set('view engine', 'ejs');
app.use(express.static('.'));
app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());

app.get('/test', function(request, response) {
    response.render('test');
});

app.get('/', function (req, res) {
    res.send('Hello World!');
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