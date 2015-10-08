// Create models
var Models = function(thinky, type, r) {

    var User = thinky.createModel('User', {
        id: type.string(),
        name: type.string()
    }); 

    var Drawing = thinky.createModel('Drawing', {
        id: type.string(),
        createdAt: type.date().default(r.now()),
        location: type.string(),
    }); 

    var Point = thinky.createModel('Point', {
        id: type.string(),
        colour: type.string(),
        drawingId: type.string(),
        userId: type.string(),
        point: type.point(),
        createdAt: type.date().default(r.now())
    });

    Drawing.hasMany(Point, 'points', 'id', 'drawingId');
    User.hasMany(Point, 'points', 'id', 'userId');

    // Create a new user
    var user = new User({
        name: "Blobman!"
    });

    user.saveAll().then(function(result) {
        console.log(result);
    });
};

module.exports = Models;
