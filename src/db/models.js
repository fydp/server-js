var developmentSettings = {
    db: "test",
    host: "localhost"
};

var productionSettings = {
    db: "test",
    host: "104.197.156.4",
    port: 28015
};


var Promise = require('bluebird');
var thinky = require('thinky')(process.env.NODE_ENV === 'production' ? productionSettings : productionSettings);

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
    var userId;
    new User({name: "Alice"}).save();
    new User({name: "Bob"}).save()
        .then(function (result) {
            userId = result.id;
        })
        .then(function () {
            return new Drawing({location: "Test!"}).save();
        })
        .then(function(result) {
            return Stroke.save(
                { colour: "#000", drawingId: result.id, userId: userId }
            );
        })
        .then(function(result) {
             console.log(result);
            return Point.save([
                {x: 3, y: 5, strokeId: result.id },
                {x: 5, y: 5, strokeId: result.id }
            ]);
        });
};

/*
 * Get model methods
 */

var get_or_create_user = function (name) {
    return new User({name : name}).save()
    .catch(function (err) {
        return Promise.resolve('duplicate');
    });
}

var get_all = function(Model) {
    return Model.orderBy({index:"createdAt"}).getJoin().run();
}

/*
 * Create model methods
 */

var create_drawing = function (location) {
    return new Drawing({location: location}).save();
}

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

/*
 * Delete model methods
 */

var clear_strokes = function(drawing_id) {
    return Drawing.get(drawing_id)
        .getJoin()
        .run()
        .then( function (drawing) {
            var promises = [];
            for (var i = 0; i < drawing.strokes.length; i++) {
                promises.push(drawing.strokes[i].deleteAll());
            }
            return Promise.all(promises);
        }); 
}

var clear_drawing = function(drawing_id) {
    return get_all(Drawing)
    .then(function (drawings) {
        var promises = [];
        for (var i = 0; i < drawings.length; i++) {
            if (drawing_id == drawings[i].id) promises.push(drawings[i].deleteAll())
        }
        return Promise.all(promises);
    });
    // for some reason, cascading delete doesn't work for this...
    /* return Drawing.get(drawing_id).run().then(function(drawing) {
            return drawing.deleteAll();
        }) */
}

var clear_db = function() {
    var overall_promises = [];
    overall_promises.push(get_all(User)
            .then(function (users) {
                for (var i = 0; i < users.length; i++) {
                    promises.push(users[i].deleteAll());
                }
                return Promise.all(promises);
            }));
    overall_promises.push(get_all(Drawing)
            .then(function (drawings) {
                for (var i = 0; i < drawings.length; i++) {
                    promises.push(drawings[i].deleteAll());
                }
                return Promise.all(promises);
            }));
    return Promise.all(overall_promises);
}

module.exports = {
    init: create_models,
    get_all_users: function() { return get_all(User) },
    get_all_drawings: function() { return get_all(Drawing) },
    get_all_strokes: function() { return get_all(Stroke) },
    get_all_points: function () { return get_all(Point) },
    get_or_create_user: get_or_create_user,
    create_drawing: create_drawing,
    create_stroke: create_stroke,
    seed: seed,
    clear_db: clear_db,
    clear_drawing: clear_drawing,
    clear_strokes : clear_strokes 
};
