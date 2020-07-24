var express = require('express');
var router = express.Router();
var [Users, Students, Teachers, Feedback] = require('../models/db');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('contact',{contact:true, form:true});
});

router.post('/', function(req,res,next){
    console.log('Sending feedback..');
    const name = req.body.name;
    const email= req.body.email;
    const topic = req.body.topic;
    const message = req.body.message;
    var feedback = new Feedback({
        name:name,
        email:email,
        topic:topic,
        message:message
    });
    console.log('Feedback : '+JSON.stringify(feedback))
    feedback.save((err)=>{
        if(err){console.log('Error saving feedback data'); res.redirect('/contact');}
        else {res.redirect('/contact');}
    });
})

module.exports = router;