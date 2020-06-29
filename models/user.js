var user = {
    name: null,
    email: null,
    about: null,
    password: null,
    phone: null,
    role: null,
    teacher: { type: Object },
    student: { type: Object },
    subects: null,
};
var student = {
    degree: null,
    email: null,
    school: null,
    fee: null,
    genderPreference: null,
    requirement: null,
};
var teacher = {
    profileHeadline: null,
    dob: null,
    fee: null,
    subjects: null,
    expertise: null,
    highestQualName: null,
    highestQualMarks: null,
    highestQualSchool: null,
    otherQualName: null,
    otherQualMarks: null,
    otherQualSchool: null,
    marks10: null,
    marks12: null,
    otherDetails: null,
}

module.exports = [user, student, teacher];