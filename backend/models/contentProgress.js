const mongoose = require('mongoose');

const contentProgressSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    isViewed: { type: Boolean, default: true },
    viewedAt: { type: Date, default: Date.now }
});

contentProgressSchema.index({ studentId: 1, contentId: 1 }, { unique: true });

module.exports = mongoose.models.ContentProgress || mongoose.model('ContentProgress', contentProgressSchema);
