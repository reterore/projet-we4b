const express = require('express');
const router = express.Router();
const Content = require('../models/Content');

// Liste des contenus d’un cours
router.get('/course/:courseId', async (req, res) => {
    try {
        const contents = await Content.find({ courseId: req.params.courseId });
        res.json(contents);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
