const Log = require('../models/Log');

async function logAction(userId, action, details = {}) {
    try {
        await Log.create({ userId, action, details });
    } catch (err) {
        console.error('❌ Erreur lors de la création du log :', err);
    }
}

module.exports = { logAction };
