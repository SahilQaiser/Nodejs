var express = require('express');
var http = require('http');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mentor', { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection to MongoDB failed:'));
db.once('open', function() {
    console.log("Connected to MongoDB");
});
//User Schema
var userSchema = new mongoose.Schema({ Name: 'string', email: 'string', password: 'string', phone: 'number', role: 'string' });
var Users = mongoose.model('Users', userSchema);
//Student Schema
var studentSchema = new mongoose.Schema({ degree: 'string', school: 'string', fee: 'string', genderPreference: 'string', requirement: 'string' });
var Students = mongoose.model('Students', studentSchema);
//Teacher Schema
var teacherSchema = new mongoose.Schema({
    profileHeadline: 'string',
    dob: 'string',
    fee: 'string',
    subjects: 'string',
    expertise: 'string',
    highestQualName: 'string',
    highestQualMarks: 'string',
    highestQualSchool: 'string',
    otherQualName: 'string',
    otherQualMarks: 'string',
    otherQualSchool: 'string',
    marks10: 'string',
    marks12: 'string',
    otherDetails: 'string'
});
var Teachers = mongoose.model('Teachers', teacherSchema);

/* GET home page. */
router.get('/', function(req, res, next) {
    if (!req.session.user)
        req.session.signup = true;
    else req.session.signup = false;
    res.render('register', {
        head: 'SignUp',
        signup: req.session.signup,
        name: req.session.user
    });
});

// router.post('/api', (req, res, next) => {
//     res.json('message:success');
// })

router.post('/signup', (req, res, next) => {
    Users.find({ email: req.body.email }, (err, users) => {
        if (err) {
            console.log("an error occured while fetching user list");
        }
        if (users.length > 0) {
            console.log('Email already registered');
            res.redirect('/');
        } else {
            var user = new Users({
                Name: req.body.name,
                password: req.body.password,
                email: req.body.email,
                phone: req.body.phone,
                role: req.body.role
            });
            user.save((err) => {
                if (err) {
                    console.log(err);
                    console.error('User cannot be Saved, Hes DEAD');
                } else
                    console.log('User Safe and Sound in MONGO');
            });
            //res.json({ name: req.body.name });
            if (req.body.role === "student")
                res.render('register', { student: 'true' });
            else if (req.body.role === "teacher")
                res.render('register', { teacher: 'true' });
        }
    });
});

// Student form
router.post('/student', (req, res, next) => {
    const degree = req.body.degree;
    const fee = req.body.fee;
    const school = req.body.school;
    const genderPreference = req.body.genderPreference;
    const requirement = req.body.requirement;
    var student = new Students({
        degree: degree,
        school: school,
        fee: fee,
        requirement: requirement,
        genderPreference: genderPreference
    });
    student.save((err) => {
        if (err) {
            console.log(err);
            console.error('Error saving student info');
        } else
            console.log('Student Information Stored');
    });
    res.redirect('/');
});
//Teacher Form
router.post('/teacher', (req, res, next) => {
    const fee = req.body.fee;
    const profileHeadline = req.body.profileHeadline;
    const dob = req.body.dob;
    const subjects = req.body.subjects;
    const expertise = req.body.expertise;
    const highestQualName = req.body.highestQualName;
    const highestQualMarks = req.body.highestQualMarks;
    const highestQualSchool = req.body.highestQualSchool;
    const otherQualName = req.body.otherQualName;
    const otherQualMarks = req.body.otherQualMarks;
    const otherQualSchool = req.body.otherQualSchool;
    const marks10 = req.body.marks10;
    const marks12 = req.body.marks12;
    const otherDetails = req.body.otherDetails;
    var teacher = new Teachers({
        profileHeadline: profileHeadline,
        dob: dob,
        fee: fee,
        subjects: subjects,
        expertise: expertise,
        highestQualName: highestQualName,
        highestQualMarks: highestQualMarks,
        highestQualSchool: highestQualSchool,
        otherQualName: otherQualName,
        otherQualMarks: otherQualMarks,
        otherQualSchool: otherQualSchool,
        marks10: marks10,
        marks12: marks12,
        otherDetails: otherDetails
    });
    teacher.save((err) => {
        if (err) {
            console.log(err);
            console.error('Error saving Teacher info');
        } else
            console.log('Teacher Information Stored');
    });
    res.redirect('/');
});
router.post('/signin', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    Users.find({ email: email }, (err, users) => {
        if (err) {
            console.log("An error occured while fetching all users");
        } else {
            users.forEach(user => {
                console.log(user.email);
                if (user.password === password) {
                    console.log('Successfully Logged in...');
                    req.session.user = user.email;
                    res.redirect('/');
                } else {
                    console.log('Password incorrect...');
                    res.redirect('/register');
                }
            })
        }
    })
})

router.post('/signout', (req, res, next) => {
    req.session = null;
    res.redirect('/register');
})

module.exports = router;