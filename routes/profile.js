var express = require('express');
var router = express.Router();
// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/friends', { useNewUrlParser: true, useUnifiedTopology: true });

// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection to MongoDB failed:'));
// db.once('open', function() {
//     console.log("Connected to MongoDB");
// });

// var schema = new mongoose.Schema({ name: 'string', age: 'number', favColor: 'string' });
// var Friends = mongoose.model('Friends', schema);
// Friends.create({ name: 'Sahil', age: 99, favColor: 'BLACK' }, function(err) {
//     if (err) return handleError(err);
//     console.log("Friends Collection Created");
// });
var name, age, favColor;
//Ftech docs
// Friends.find({}, (err, friends) => {
//     if (err) return handleError(err);
//     name = friends[0].name;
//     age = friends[0].age;
//     favColor = friends[0].favColor;
// });

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('profile', { name: "name", email: "sq@sq.com", phone: "789" });
});

module.exports = router;