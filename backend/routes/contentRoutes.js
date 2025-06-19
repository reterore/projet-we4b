const express = require('express');
const multer = require('multer');
const path = require('path');
const Content = require('../models/Content');

const router = express.Router();

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// POST - ajouter contenu texte ou fichier
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const { title, type, text, moduleId } = req.body;
        const contentData = { title, type, moduleId };

        if (type === 'text') {
            contentData.text = text;
        } else if (type === 'file' && req.file) {
            contentData.file = {
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                path: req.file.path,
            };
        }

        const newContent = new Content(contentData);
        await newContent.save();
        res.status(201).json(newContent);
    } catch (err) {
        console.error('Erreur ajout contenu :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET - récupérer les contenus d’un module
router.get('/module/:moduleId', async (req, res) => {
    try {
        const contents = await Content.find({ moduleId: req.params.moduleId });
        res.json(contents);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
