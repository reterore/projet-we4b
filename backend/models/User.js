const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    prenom: {
        type: String,
        required: true,
        trim: true
    },
    nom: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student'
    },
    selectedCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]
}, {
    timestamps: true // facultatif : ajoute createdAt et updatedAt
});

module.exports = mongoose.model('User', userSchema);
