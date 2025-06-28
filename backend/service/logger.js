const mongoose = require('mongoose');
const Log = require('../models/Log');

const LOG_ACTIONS = ['login', 'logout', 'course_view', 'user_deleted', 'course_created', 'course_updated'];

async function logAction(userId, action, details = {}) {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.warn('⚠️ userId invalide ou manquant :', userId);
        return;
    }

    if (!action || !LOG_ACTIONS.includes(action)) {
        console.warn('⚠️ action invalide ou inconnue :', action);
        return;
    }

    try {
        await Log.create({ userId, action, details });
        console.log(`✅ Log enregistré : ${action} pour ${userId}`);
    } catch (err) {
        console.error('❌ Erreur lors de la création du log :', err);
    }
}

module.exports = { logAction };
