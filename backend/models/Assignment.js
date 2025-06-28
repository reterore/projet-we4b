const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const submissionSchema = require('./Submission');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    dueDate: {
        type: Date,
        required: true
    },
    moduleId: {
        type: Schema.Types.ObjectId,
        ref: 'Module'
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    submissions: [submissionSchema]
});

module.exports = mongoose.model('Assignment', assignmentSchema);
