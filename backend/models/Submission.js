const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    file: {
        filename: String,
        originalname: String,
        mimetype: String,
        size: Number,
        path: String
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['en attente', 'corrigé', 'en retard'],
        default: 'en attente'
    },
    grade: {
        type: Number,
        min: 0,
        max: 20
    },
    comment: String
});

module.exports = submissionSchema;
