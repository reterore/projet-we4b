const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['login', 'logout', 'course_view', 'course_deleted', 'course_created', 'course_updated']
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Log', logSchema);
