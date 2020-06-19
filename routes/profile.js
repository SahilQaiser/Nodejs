var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('profile', { layout: 'dashboard-layout' });
});
/* GET User Profile. */
router.get('/user', function(req, res, next) {
    res.render('user-profile', { layout: 'dashboard-layout' });
});
/* GET User Profile. */
router.get('/notifications', function(req, res, next) {
    res.render('notifications', { layout: 'dashboard-layout' });
});

/* GET User Profile. */
router.get('/tables', function(req, res, next) {
    res.render('tables', { layout: 'dashboard-layout' });
});
/* GET User Profile. */
router.get('/upgrade', function(req, res, next) {
    res.render('upgrade', { layout: 'dashboard-layout' });
});
module.exports = router;