const express = require('express');
const router = express.Router();
const Module = require('../models/Module'); // modèle Mongoose

// Créer un module
router.post('/', async (req, res) => {
    try {
        const { title, courseId } = req.body;
        const newModule = new Module({ title, courseId });
        const saved = await newModule.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: 'Erreur création module' });
    }
});

// Récupérer les modules d’un cours
router.get('/course/:courseId', async (req, res) => {
    try {
        const modules = await Module.find({ courseId: req.params.courseId });
        res.json(modules);
    } catch (err) {
        res.status(500).json({ error: 'Erreur récupération modules' });
    }
});

module.exports = router;
