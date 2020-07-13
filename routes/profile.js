var express = require('express');
var router = express.Router();
var [Users, Students, Teachers, Messages] = require('../models/db');

function getUserDetails(req, res) {
    var [user, student, teacher] = require('../models/user');
    req.session.curuser = user;
    console.log(req.session.userRole);
    Users.findOne({ email: req.session.userEmail }, (err, user) => {
        if (err) {
            console.log('An error occured while reading users table');
        } else {
            req.session.curuser.name = user.name;
            req.session.curuser.email = user.email;
            req.session.curuser.phone = user.phone;
            req.session.curuser.about = user.about;
            req.session.curuser.displayPic = user.displayPic;
            req.session.curuser.userRole = user.role;
        }
    });
    if (req.session.curuser.userRole === 'student') {
        Students.findOne({ email: req.session.userEmail }, (err, student) => {
            if (err) {
                console.log("An error occured while fetching all Students");
            } else {
                if (!student) {
                    console.log("An error occured find details of user");
                } else {
                    console.log("Student : " + req.session.curuser.name);
                    req.session.curuser.student = student;
                    req.session.curuser.teacher = false;
                }
            }
        });
    }
    if (req.session.curuser.userRole === 'teacher') {
        Teachers.findOne({ email: req.session.userEmail }, (err, teacher) => {
            if (err) {
                console.log("An error occured while fetching all Teachers");
            } else {
                if (!teacher) {
                    console.log("Error searching fro teachers..");
                } else {
                    console.log("Teacher : " + req.session.curuser.name);
                    req.session.curuser.teacher = teacher;
                    req.session.curuser.student = false;
                    var subjects = req.session.curuser.teacher.subjects;
                    //req.session.recommendations = null;
                    //getStudentList(req, subjects);
                }
            }
        });
    }
    return req.session.curuser;
};

function getStudentList(req, subjects) {
    var students = [];
    req.session.recommendations = [];
    subjects.forEach(subject => {
        Students.find({ subjects: subject }, (err, stds) => {
            stds.forEach(std => {

                if (students.includes(std.email)) {
                    console.log('Student exists..');
                } else {
                    students.push(std.email);
                    req.session.recommendations.push(std);
                    //console.log('Students : ' + JSON.stringify(students));
                }
            });
        });
    });
}

function getTeacherList(req, subjects) {
    var teachers = [];
    req.session.recommendations = [];
    subjects.forEach(subject => {
        Teachers.find({ subjects: subject }, (err, tchs) => {
            tchs.forEach(tch => {

                if (teachers.includes(tch.email)) {
                    console.log('Teacher exists..');
                } else {
                    teachers.push(tch.email);
                    req.session.recommendations.push(tch);
                    //console.log('Students : ' + JSON.stringify(students));
                }
            });
        });
    });
}

async function getMessages(req, recipient)
{
    console.log("Msgslimit : "+req.session.limit);
    var msgs = await Messages.find({$or: [{$and: [{from : req.session.userEmail },{to: recipient}]},{$and:[{to : req.session.userEmail },{from: recipient}]}]}).sort({created: 'desc'}).limit(req.session.limit);
    var formattedMsgs = await formatMsgs(req, msgs);
    return formattedMsgs;
}
async function formatMsgs(req, msgs)
{
    msgs.forEach(msg=>{
        if(msg.to == req.session.userEmail)
            msg.sent = true;
        else msg.recieved = true;
    });
    return msgs.reverse();
}
/* GET home page. */
router.get('/', function(req, res, next) {
    if (!req.session.userEmail) {
        console.log('No Session found, Redirecting to homepage');
        res.redirect('/');
    } else {
        var curuser = getUserDetails(req, res);
        //user.email = req.session.userEmail;
        sleep(1000).then(() => {
            res.render('profile', { user: req.session.curuser, layout: 'dashboard-layout' });
        })
    }
});
//Update Profile
router.post('/update', function(req, res, next) {
    console.log('profile Updating..' + req.session.userEmail);
    Users.findOneAndUpdate({ email: req.session.userEmail }, {
        displayPic: req.body.displayPic,
        name: req.body.name
    }).then(rows => {
        console.log(rows + ' Rows Updated Successfully');
    }).catch(err => {
        console.log(err);
    });
    if (req.session.curuser.userRole === 'student') {
        Students.findOneAndUpdate({ email: req.session.userEmail }, {
            degree: req.body.degree,
            requirement: req.body.requirement,
            school: req.body.school
        }).then(rows => {
            console.log(rows + ' Rows Updated Successfully');
        }).catch(err => {
            console.log(err);
        })
    }
    if (req.session.curuser.userRole === 'teacher') {
        Teachers.findOneAndUpdate({ email: req.session.userEmail }, {
            highestQualName: req.body.highestQualName,
            profileHeadline: req.body.profileHeadline,
            highestQualSchool: req.body.highestQualSchool
        }).then(rows => {
            console.log(rows + ' Rows Updated Successfully');
        }).catch(err => {
            console.log(err);
        })
    }
    res.redirect('/profile');
});

// SignOut
router.post('/signout', (req, res, next) => {
    req.session = null;
    curuser = null;
    res.redirect('/');
});

/* GET User Profile. */
router.get('/user', function(req, res, next) {
    if (!req.session.userEmail)
        res.redirect('/');
    else {
        getUserDetails(req, res);
        sleep(1000).then(() => {
            res.render('user-profile', { user: req.session.curuser, layout: 'dashboard-layout' });
        })
    }
});
/* GET User Profile. */
router.get('/chat', async function(req, res, next) {
    if (!req.session.userEmail)
        res.redirect('/');
    else
    {
        req.session.limit = req.session.limit ? req.session.limit : 10;
        if (req.session.curuser.teacher) { getStudentList(req, req.session.curuser.teacher.subjects); } else { getTeacherList(req, req.session.curuser.student.subjects); }
        var messages = await getMessages(req, req.session.recipient);
        res.render('chat', { messages: messages, recipient: req.session.recipient, recommendations: req.session.recommendations, user: req.session.curuser, layout: 'dashboard-layout' });
    }
});
/* Chat Recipient */
router.post('/recipient', async function(req,res,next){
    req.session.recipient = req.body.recipient;
    res.redirect('/profile/chat');
});
/* loadMoreMessages */
router.post('/loadMoreMessages', async function(req,res,next){
    req.session.limit+=parseInt(req.body.limit);
    res.redirect('/profile/chat');
});
/* POST chat messages */
router.post('/chat', function(req,res,next){
    if (!req.session.userEmail)
        res.redirect('/');
    else {
        console.log('to '+req.body.to);
        console.log('from '+req.body.from);
        console.log('message '+req.body.message);
        var msg = new Messages({
            to : req.body.to,
            from : req.body.from,
            message: req.body.message,
            created: new Date()
        });
        msg.save((err)=>{
            if(err){
                console.log('Something bad happened, cant chat..');
            }
            else {
                console.log('msg sent...');
                res.redirect('/profile/chat');
            }
        });
    }
});

/* GET User Profile. */
router.get('/recommendations', function(req, res, next) {
    if (!req.session.userEmail)
        res.redirect('/');
    else {
        console.log('Recommendations list not ready');
        if (req.session.curuser.teacher) { getStudentList(req, req.session.curuser.teacher.subjects); } else { getTeacherList(req, req.session.curuser.student.subjects); }
        sleep(1000).then(() => {
            res.render('recommendations', { recommendations: req.session.recommendations, user: req.session.curuser, layout: 'dashboard-layout' });
        });
    }
});
/* GET User Profile. */
router.get('/upgrade', function(req, res, next) {
    if (!req.session.userEmail)
        res.redirect('/');
    else
        res.render('upgrade', { user: req.session.curuser, layout: 'dashboard-layout' });
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports = router;