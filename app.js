// external libraries
var body_parser  = require('body-parser');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// user code
var config = require('./config');
var db_client = require('./src/db/models');

server.listen(config.port);

app.set('view engine', 'ejs');
app.use(express.static('./src/'));
app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());

db_client.init();
db_client.seed();

app.set('views', __dirname + '/src/views');

app.get('/test', function(request, response) {
    response.render('test', { port : config.port });
});

app.get('/', function (req, res) {
    res.send('Our FYDP project is the best. yo.');
});

// Delete this row if you want to see debug messages
io.set('log level', 1);

// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) {
    socket.on('init', function (data) {
        db_client.get_or_create_user(data.name)
            .then(function () {
                return db_client.get_all_drawings();
            })
            .then(function (drawings) {
                socket.emit('draw_points', drawings);
            });
    });

    // Start listening for mouse move events
    socket.on('mousemove', function (data) {
        // This line sends the event (broadcasts it)
        // to everyone except the originating client.
        socket.broadcast.emit('moving', data);
    });
});
