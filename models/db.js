var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mentor', { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection to MongoDB failed:'));
db.once('open', function() {
    console.log("Connected to MongoDB");
});
//User Schema
var userSchema = new mongoose.Schema({ name: 'string', email: 'string', displayPic: 'string', about: 'string', password: 'string', phone: 'number', role: 'string' });
var Users = mongoose.model('Users', userSchema);
//Student Schema
var studentSchema = new mongoose.Schema({ name: 'string', degree: 'string', email: 'string', school: 'string', subjects: [{ type: String }], genderPreference: 'string', requirement: 'string' });
var Students = mongoose.model('Students', studentSchema);
//Teacher Schema
var teacherSchema = new mongoose.Schema({
    profileHeadline: 'string',
    dob: 'string',
    name: 'string',
    email: 'string',
    phone: 'string',
    subjects: [{ type: String }],
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

module.exports = [Users, Students, Teachers];