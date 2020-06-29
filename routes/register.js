var express = require('express');
var http = require('http');
var router = express.Router();
var [Users, Students, Teachers] = require('../models/db');

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
                name: req.body.name,
                password: req.body.password,
                email: req.body.email,
                phone: req.body.phone,
                displayPic: req.body.displayPic,
                role: req.body.role,
                about: req.body.about
            });
            user.save((err) => {
                if (err) {
                    console.error('User cannot be Saved, Hes DEAD');
                    console.log(err);
                } else {
                    req.session.userEmail = req.body.email;
                    req.session.signup.roleform = false;
                    console.log('User Safe and Sound in MONGO');
                }
            });
            //res.json({ name: req.body.name });
            if (req.body.role === "student")
                res.render('register', { student: 'true', email: req.body.email });
            else if (req.body.role === "teacher")
                res.render('register', { teacher: 'true', email: req.body.email });
        }
    });
});

// Student form
router.post('/student', (req, res, next) => {
    const degree = req.body.degree;
    const name = req.body.name;
    const school = req.body.school;
    const genderPreference = req.body.genderPreference;
    const requirement = req.body.requirement;
    const email = req.body.email;
    const subjects = req.body.subjects;
    var student = new Students({
        degree: degree,
        school: school,
        subjects: subjects,
        name: name,
        requirement: requirement,
        genderPreference: genderPreference,
        email: email
    });
    student.save((err) => {
        if (err) {
            console.log(err);
            console.error('Error saving student info');
        } else {
            req.session.userEmail = req.body.email;
            req.session.signup.roleform = true;
            console.log('Student Information Stored');
        }
    });
    res.redirect('/profile');
});
//Teacher Form
router.post('/teacher', (req, res, next) => {
    const name = req.body.name;
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
    const email = req.body.email;
    const otherDetails = req.body.otherDetails;
    var teacher = new Teachers({
        profileHeadline: profileHeadline,
        dob: dob,
        email: email,
        name: name,
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
        } else {
            req.session.userEmail = req.body.email;
            req.session.signup.roleform = true;
            console.log('Teacher Information Stored');
        }
    });
    res.redirect('/profile');
});
router.post('/signin', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    Users.findOne({ email: email }, (err, user) => {
        if (err) {
            console.log("An error occured while fetching all users");
        } else {
            if (!user) {
                console.log('User not found');
                res.redirect('/register');
            } else {
                if (user.password === password) {
                    console.log('Successfully Logged in...');
                    req.session.userEmail = user.email;
                    req.session.userRole = user.role;
                    res.redirect('/profile');
                } else {
                    console.log('Password incorrect...');
                    res.redirect('/register');
                }
            }
        }
    })
});

module.exports = router;