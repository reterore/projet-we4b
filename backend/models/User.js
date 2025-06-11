const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    passwordHash: String,
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    selectedCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]
});

module.exports = mongoose.model('User', userSchema);
