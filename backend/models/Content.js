const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['text', 'file'], required: true },
    text: { type: String }, // si type == 'text'
    file: {
        filename: String,
        originalName: String,
        mimeType: String,
        size: Number,
        path: String,
    }, // si type == 'file'
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    createdAt: { type: Date, default: Date.now }
});

// ✅ Évite les redéfinitions
module.exports = mongoose.models.Content || mongoose.model('Content', contentSchema);
