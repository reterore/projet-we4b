const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Log = require('../models/Log');
const { LOG_ACTIONS } = require('../models/Log'); // si enum exportée

router.post('/', async (req, res) => {
    const { userId, action, details } = req.body;

    if (!userId || !action) {
        return res.status(400).json({ error: 'Les champs userId et action sont requis.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'userId invalide (ObjectId attendu).' });
    }

    if (LOG_ACTIONS && !LOG_ACTIONS.includes(action)) {
        return res.status(400).json({ error: `Action invalide. Actions autorisées : ${LOG_ACTIONS.join(', ')}` });
    }

    try {
        const log = await Log.create({ userId, action, details });
        res.status(201).json(log);
    } catch (err) {
        console.error('❌ Erreur lors de la création du log :', err);
        res.status(500).json({ error: 'Erreur serveur lors de la création du log.' });
    }
});

router.get('/', async (req, res) => {
    try {
        const logs = await Log.find().sort({ createdAt: -1 }).populate('userId', 'email role');
        res.status(200).json(logs);
    } catch (err) {
        console.error('❌ Erreur lors de la récupération des logs :', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des logs.' });
    }
});

module.exports = router;
