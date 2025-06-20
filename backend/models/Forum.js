const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    author: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: () => new Date(), required: true }
});

const forumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    messages: [messageSchema]
});

module.exports = mongoose.model('Forum', forumSchema);
