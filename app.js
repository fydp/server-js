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
    res.send('Our FYDP project is the best. yo. Version 4.1');
});

// Delete this row if you want to see debug messages
io.set('log level', 1);

// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) {
    socket.on('INIT', function (data) {
        return_data = {};
        return_data.userId = data.userId;
        return_data.drawingId = data.drawingId;
        db_client.get_all_drawings()
            .then(function (result) {
                /*
                 * result = [ 
                 *      {
                 *          location,
                 *          id,
                 *          strokes = [
                 *              {
                 *                  user_id,
                 *                  colour,
                 *                  points = [
                 *                      {
                 *                          x,
                 *                          y
                 *                      },
                 *                      ...
                 *                  ]
                 *              },
                 *              ...
                 *          ]
                 *      },
                 *      ...
                 *  ]
                 */
                socket.emit('RECEIVE_ALL_DRAWINGS', result);
            });
    });

    socket.on('SEND_POINTS', function (data) {
        db_client.create_stroke(data.userId, data.drawingId, data.colour, data.points)
            .then(function () {
                socket.boardcast.emit('RECEIVE_POINTS', data);
            });
    });

    socket.on('CLEAR_DRAWING', function (data) {
        db_client.clear_drawing(data.drawingId)
            .then(function () {
                socket.broadcast.emit('CLEAR_DRAWING');
            });
    });
});
