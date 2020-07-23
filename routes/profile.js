var express = require('express');
var router = express.Router();
var [Users, Students, Teachers, Feedback, Messages, Notifications] = require('../models/db');

async function getNotifications(req, res)
{
    console.log('SessionMail : '+req.session.userEmail);
    var notifications = await Notifications.find({email:req.session.userEmail});
    return notifications;
}

async function getNotificationsCount(req, res)
{
    var count = await Notifications.find({$and: [{email:req.session.userEmail}, {read:false}]}).count();
    return count;
}
async function getUserDetails(req, res) {
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
                    req.session.curuser.admin = false;
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
                    req.session.curuser.admin = false;
                    var subjects = req.session.curuser.teacher.subjects;
                    //req.session.recommendations = null;
                    //getStudentList(req, subjects);
                }
            }
        });
    }
    if (req.session.curuser.userRole === 'admin') {
        req.session.curuser.admin = true;
        req.session.curuser.student = false;
        req.session.curuser.teacher = false;
    }
};
async function getAll(req){
    Teachers.find({},(err,teachers) => {
        req.session.teachers = teachers;
    });
    Students.find({},(err, students) =>{
        req.session.students = students;
    });
    Feedback.find({},(err, feedbacks) =>{
        req.session.feedbacks = feedbacks;
    })
}
async function getStudentList(req, subjects) {
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

async function getTeacherList(req, subjects) {
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

//Get Messages
async function getMessages(req, recipient)
{
    console.log('limit : '+req.session.limit);
    var msgs = await Messages.find({$or:[{$and: [{to: req.session.userEmail}, {from: recipient}]}, {$and: [{from: req.session.userEmail}, {to: recipient}]}]});
    var formattedMsg = await formatMsgs(req,msgs);
    return formattedMsg;
}
//Format msgs - Sent or Recieved
async function formatMsgs(req,msgs)
{
    msgs.forEach( async msg=>{
        await Users.findOne({email: msg.from}, (err, user)=>{
            msg.senderName = user.name;
            Users.findOne({email: msg.to}, (err, user)=>{
                msg.recipientName = user.name;
            });
        });
        if(msg.from == req.session.userEmail)
        {
            msg.sent = true;
        } else msg.sent = false;
    });
    return msgs;
}
/* GET home page. */
router.get('/', async function(req, res, next) {
    if (!req.session.userEmail) {
        console.log('No Session found, Redirecting to homepage');
        res.redirect('/');
    } else {
        var count = await getNotificationsCount(req,res);
        await getNotifications(req,res);
        await getUserDetails(req, res);
        res.render('profile', {count: count, notifications: req.session.notifications, firstTime: req.session.firstTime, user: req.session.curuser,dashboard: true, layout: 'dashboard-layout' });
        req.session.firstTime= false;
    }
});
//Update Profile
router.post('/update', async function(req, res, next) {
    console.log('profile Updating..' + req.session.userEmail);
    Users.findOneAndUpdate({ email: req.session.userEmail }, {
        displayPic: req.body.displayPic,
        name: req.body.name
    }).then(rows => {
        var notification = new Notifications({
            email : req.body.email,
            content : 'Profile Updated Successfully',
            read : false,
            created: new Date(),
            link : '/profile/user'
        });
        notification.save((err)=>{
            if(err){console.log(err + ' : Errror')};
        });
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
            req.session.updateSuccess = true;
        }).catch(err => {
            console.log(err);
        })
    }
    res.redirect('/profile/user');
});

// SignOut
router.post('/signout', (req, res, next) => {
    req.session = null;
    curuser = null;
    res.redirect('/');
});

/* GET User Profile. */
router.get('/user', async function(req, res, next) {
    if (!req.session.userEmail)
        res.redirect('/');
    else {
        var count = await getNotificationsCount(req,res);
        await getUserDetails(req, res);
        res.render('user-profile', {count: count, user: req.session.curuser, userProfile:true, layout: 'dashboard-layout' });
    }
});
/* GET User Profile. */
router.get('/chat', async function(req, res, next) {
    console.log('Email : '+req.session.userEmail);
    if (!req.session.userEmail)
        res.redirect('/');
    else
    {
        //req.session.limit = req.session.limit ? req.session.limit : 10;
        var count = await getNotificationsCount(req,res);
        var messages = await getMessages(req, req.session.recipient);
        console.log('message size : '+messages.length);
        if (req.session.curuser.teacher) {await getStudentList(req, req.session.curuser.teacher.subjects); } else {await  getTeacherList(req, req.session.curuser.student.subjects); }
        res.render('chat', {count: count, messages: messages, user: req.session.curuser,chat:true,recipient:req.session.recipient, recommendation:req.session.recommendations, layout: 'dashboard-layout' });
    }
});
// Change recipient
router.post('/recipient', async function(req,res,next){
    req.session.recipient = req.body.recipient;
    console.log('[recipient] Email : '+req.session.userEmail);
    res.redirect('/profile/chat');
})
// Save Chat messages
router.post('/chat', async function(req,res,next){
    if (!req.session.userEmail)
        res.redirect('/');
    else
    {
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
                var notification = new Notifications({
                    email : req.session.recipient,
                    content : 'New Message Recieved',
                    read : false,
                    created: new Date(),
                    link : '/profile/chat'
                });
                notification.save((err)=>{
                    if(err){console.log(err + ' : Errror')};
                });
                res.redirect('/profile/chat');
            }
        });
    }
});
/* loadMoreMessages
router.post('/loadMoreMessages', async function(req,res,next){
    req.session.limit+=parseInt(req.body.limit);
    res.redirect('/profile/chat');
});  */
/* GET Notifications */
router.get('/notifications',async function(req, res) {
    var notifications = await getNotifications(req, res);
    console.log('Notifications : '+JSON.stringify(notifications));
    var count = await getNotificationsCount(req, res);
    res.render('notifications',{count : count, notifications: notifications, user: req.session.curuser, layout: 'dashboard-layout'});
});
/* Notifications Update */
router.post('/updateNotification',async function(req,res){
    console.log("id : "+req.body.id);
    Notifications.findByIdAndUpdate({_id:req.body.id }, {
        read: req.body.value
    }).then(rows => {
        console.log(' Notification Updated Successfully');
    }).catch(err => {
        console.log(err);
    });
    res.redirect('/profile/notifications');
});
/* delete a Notification */
router.post('/deleteNotification', async function(req, res){
    Notifications.deleteOne({_id: req.body.id},(err)=> {
        if(err)
        {
            console.log('Error deleting notification');
        }
        res.redirect('/profile/notifications');
    })
})
/* GET User Profile. */
router.get('/recommendations', async function(req, res, next) {
    if (!req.session.userEmail)
        res.redirect('/');
    else {
        var count = await getNotificationsCount(req,res);
        console.log('Recommendations list not ready');
        if (req.session.curuser.teacher) {await getStudentList(req, req.session.curuser.teacher.subjects); } else {await  getTeacherList(req, req.session.curuser.student.subjects); }
        res.render('recommendations', {count: count, recommendations: req.session.recommendations, user: req.session.curuser, layout: 'dashboard-layout' });
        }
});
/* GET User Profile. */
router.get('/admin', async function(req, res, next) {
    console.log('Inside Admin, Email : '+JSON.stringify(req.session));
    if (!req.session.userEmail)
        res.redirect('/');
    else{
        var count = await getNotificationsCount(req,res);
        await getAll(req);
        res.render('admin', {count: count, feedbacks: req.session.feedbacks,admin:true, user: req.session.curuser, teachers: req.session.teachers, students: req.session.students, layout: 'dashboard-layout' });
    }
});
module.exports = router;