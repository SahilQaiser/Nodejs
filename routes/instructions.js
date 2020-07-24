var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (!req.session.user)
        res.render('instructions',{instruction:true});
    else
        res.redirect('/profile');
});

module.exports = router;