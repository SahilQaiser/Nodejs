var express = require('express');
var router = express.Router();

var user = {
    name: 'Eram Fatima',
    email: 'erum3011@gmail.com',
    firstName: 'Eram',
    lastName: 'Fatima',
    address: 'Fatima House, New delhi'
};


/* GET home page. */
router.get('/', function(req, res, next) {
    if (!req.session.user)
        res.redirect('/');
    else
        res.render('profile', { user: user, layout: 'dashboard-layout' });
});
// SignOut
router.post('/signout', (req, res, next) => {
    req.session = null;
    res.redirect('/');
})

/* GET User Profile. */
router.get('/user', function(req, res, next) {
    if (!req.session.user)
        res.redirect('/');
    else
        res.render('user-profile', { user: user, layout: 'dashboard-layout' });
});
/* GET User Profile. */
router.get('/notifications', function(req, res, next) {
    if (!req.session.user)
        res.redirect('/');
    else
        res.render('notifications', { layout: 'dashboard-layout' });
});

/* GET User Profile. */
router.get('/tables', function(req, res, next) {
    if (!req.session.user)
        res.redirect('/');
    else
        res.render('tables', { layout: 'dashboard-layout' });
});
/* GET User Profile. */
router.get('/upgrade', function(req, res, next) {
    if (!req.session.user)
        res.redirect('/');
    else
        res.render('upgrade', { layout: 'dashboard-layout' });
});
module.exports = router;