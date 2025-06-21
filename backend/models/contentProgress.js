const mongoose = require('mongoose');

const contentProgressSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    isViewed: { type: Boolean, default: true },
    viewedAt: { type: Date, default: Date.now }
});

// 🔒 Empêche les doublons (1 élève, 1 contenu max)
contentProgressSchema.index({ studentId: 1, contentId: 1 }, { unique: true });

// ✅ Correction ici : évite de redéfinir le modèle si déjà existant
module.exports = mongoose.models.ContentProgress || mongoose.model('ContentProgress', contentProgressSchema);
