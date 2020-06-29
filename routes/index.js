var express = require('express');
var router = express.Router();
var app = express();
/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.session.userEmail) {
        res.redirect('/profile');
    } else
        res.render('index', { websiteName: 'Educational-Website' });
});


module.exports = router;