var thinky = require('thinky')({
    db: "fydp"
});

var type = thinky.type;
var r = thinky.r;

// Models
var User;
var Drawing;
var Point;

// Create models
var create_models = function() {

    User = thinky.createModel('User', {
        id: type.string(),
        name: type.string(),
        createdAt: type.date().default(r.now())
    }, {
        pk: "name"
    });
    
    User.ensureIndex("name");
    User.ensureIndex("createdAt"); 

    Drawing = thinky.createModel('Drawing', {
        id: type.string(),
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

    Drawing.hasMany(Point, 'points', 'id', 'drawingId');
    User.hasMany(Drawing, 'drawings', 'id', 'userId');
};

var seed = function () {
    new Drawing({}).save()
        .then(function(result) {
            return Point.save([{x:5,y:5,color:"#000",drawingId: result.id}, {x:100,y:100, color:"#000", drawingId: result.id}]);
        })
        .then(function(result) {
            console.log(result);
        });
}

var get_all = function(Model, callback) {
    Model.orderBy({index:"createdAt"}).getJoin().run().then(function(result) {
        if (callback && typeof callback === 'function') callback(result);
    }).error(function (err) {
        console.log(err);
    });
}

module.exports = {
    init : create_models,
    get_all_users : function(callback) { get_all(User, callback) },
    get_all_drawings : function(callback) { get_all(Drawing, callback) },
    get_all_points : function(callback) { get_all(Point, callback) },
    seed : seed
};
