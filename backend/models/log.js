const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },  // ex: 'created_course', 'deleted_module'
    details: { type: Object },                 // données supplémentaires (courseId, title, etc.)
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);
