const express = require('express');
const router = express.Router();
const Logs = require('../models/Log');

// POST /api/logs — Création d’un log
router.post('/', async (req, res) => {
    const { userId, action, details } = req.body;

    if (!userId || !action) {
        return res.status(400).json({ error: 'userId et action sont requis.' });
    }

    try {
        const log = await Logs.create({ userId, action, details });
        res.status(201).json(log);
    } catch (err) {
        console.error('❌ Erreur POST /logs :', err);
        res.status(500).json({ error: 'Erreur lors de la création du log.' });
    }
});

// ✅ GET /api/logs — Récupération de tous les logs
router.get('/', async (req, res) => {
    try {
        const logs = await Logs.find().sort({ createdAt: -1 }); // tri du plus récent au plus ancien
        res.status(200).json(logs);
    } catch (err) {
        console.error('❌ Erreur GET /logs :', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des logs.' });
    }
});

module.exports = router;
