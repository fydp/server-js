var thinky = require('thinky')({
    db: "fydp"
});

var type = thinky.type;
var r = thinky.r;

// Models
var User;
var Drawing;
var Point;

var create_models = function() {

    User = thinky.createModel('User', {
        name: type.string(),
        createdAt: type.date().default(r.now())
    }, {
        pk: "name"
    });
    
    User.ensureIndex("name");
    User.ensureIndex("createdAt"); 

    Drawing = thinky.createModel('Drawing', {
        id: type.string(),
        color: type.string(),
        location: type.string(),
        userId: type.string(),
        createdAt: type.date().default(r.now())
    }); 

    Drawing.ensureIndex("createdAt");

    Point = thinky.createModel('Point', {
        id: type.string(),
        colour: type.string(),
        drawingId: type.string(),
        x: type.number(),
        y: type.number(),
        createdAt: type.date().default(r.now())
    });

    Point.ensureIndex("createdAt");

    Drawing.hasMany(Point, 'points', 'id', 'drawingId');
    User.hasMany(Drawing, 'drawings', 'name', 'userId');
};

var seed = function () {
    new Drawing({color:"#000"}).save()
        .then(function(result) {
            return Point.save([{x:5,y:5,color:"#000",drawingId: result.id}, {x:100,y:100,drawingId: result.id}]);
        })
        .then(function(result) {
            console.log(result);
        });
}

var create_point = function(drawing_id, x, y) {
    return new Point({x:x,y:y,drawingId:drawing_id}).save();
}

var create_points = function(drawing_id, coord_array) {
    promise = Promise.resolve();
    for (var i = 0; i < coord_array.length; i++) {
        promise = promise.then((function (index) {
            return function () {
                return create_point(drawing_id, coord_array[index].x, coord_array[index].y);
            }
        })(i));
    }
    return promise;
}

var create_user = function (name) {
    return new User({name : name}).save();
}

var create_drawing = function (user_id, timestamp, color) {
    console.log(user_id);
    return new Drawing({userId:user_id, id:user_id + "-" + timestamp, color: color}).save();
}

var get_all = function(Model) {
    return Model.orderBy({index:"createdAt"}).getJoin().run();
}

var clear_db = function() {
    return get_all(User)
        .then(function (users) {
            var promises = [];
            for (var i = 0; i < users.length; i++) {
                promises.push(users[i].deleteAll())
            }
            return Promise.all(promises);
        });
}

module.exports = {
    init : create_models,
    get_all_users : function() { return get_all(User) },
    get_all_drawings : function() { return get_all(Drawing) },
    get_all_points : function() { return get_all(Point) },
    create_user : create_user,
    create_drawing : create_drawing,
    create_point : create_point,
    create_points : create_points,
    seed : seed,
    clear_db : clear_db
};
