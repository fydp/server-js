var developmentSettings = {
    db: "test",
    host: "localhost"
};

var productionSettings = {
    db: "test",
    host: "104.197.0.137",
    port: 28015
};

var thinky = require('thinky')(process.env.NODE_ENV === 'production' ? productionSettings : developmentSettings);

var type = thinky.type;
var r = thinky.r;

// Models
var User;
var Drawing;
var Stroke;
var Point;

var create_models = function() {
    User = thinky.createModel('User', {
        id: type.string(),
        name: type.string(),
        createdAt: type.date().default(r.now())
    });

    User.ensureIndex("createdAt"); 

    Drawing = thinky.createModel('Drawing', {
        id: type.string(),
        location: type.string(),
        createdAt: type.date().default(r.now())
    }); 

    Drawing.ensureIndex("createdAt");

    Stroke = thinky.createModel('Stroke', {
        id: type.string(),
        colour: type.string(),
        drawingId: type.string(),
        userId: type.string(),
        createdAt: type.date().default(r.now())
    });

    Stroke.ensureIndex("createdAt");

    Point = thinky.createModel('Point', {
        id: type.string(),
        strokeId: type.string(),
        x: type.number(),
        y: type.number(),
        createdAt: type.date().default(r.now())
    });

    Point.ensureIndex("createdAt");

    User.hasMany(Stroke, 'strokes', 'id', 'userId');
    Drawing.hasMany(Stroke, 'strokes', 'id', 'drawingId');
    Stroke.hasMany(Point, 'points', 'id', 'strokeId');
};

var seed = function() {
    new User({name: "Alice"}).save();
    new User({name: "Bob"}).save();
    new Drawing({location: "Test!"}).save();

    // .then(function(result) {
    //     userId = result.id;
    //     return new Drawing({location: "test"}).save();
    // })
    // .then(function(result) {
    //     return Stroke.save(
    //         { colour: "#000", drawingId: result.id, userId: userId }
    //     );
    // })
    // .then(function(result) {
    //     console.log(result);
    //     return Point.save([
    //         {x: 3, y: 5, strokeId: result.id },
    //         {x: 5, y: 5, strokeId: result.id }
    //     ]);
    // });
};

var create_stroke = function(user_id, drawing_id, colour, coord_array) {
    return new Stroke({
        userId : user_id,
        drawingId : drawing_id,
        colour: colour
    }).save()
    .then(function(result) {
        var points = [];
        for (var i = 0; i < coord_array.length; i++) {
            points.push({colour: colour, strokeId: result.id, x: coord_array[i].x, y: coord_array[i].y});
        }
        return Point.save(points);
    });
    return promise;
}

var get_or_create_user = function (name) {
    return new User({name : name}).save()
    .catch(function (err) {
        return Promise.resolve('duplicate');
    });
}

var create_drawing = function (location) {
    return new Drawing({location: location}).save();
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
    init: create_models,
    get_all_users: function() { return get_all(User) },
    get_all_drawings: function() { return get_all(Drawing) },
    get_all_strokes: function() { return get_all(Stroke) },
    get_or_create_user: get_or_create_user,
    create_drawing: create_drawing,
    create_stroke: create_stroke,
    seed: seed,
    clear_db: clear_db
};
