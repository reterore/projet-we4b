const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Content = require('../models/Content');

const router = express.Router();

// S'assurer que le dossier 'uploads' existe
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuration de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// POST - Ajouter un contenu (texte ou fichier)
router.post('/', upload.single('file'), async (req, res) => {
    console.log('[POST /api/contents] Reçu', req.body, req.file);
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
        } else {
            return res.status(400).json({ error: 'Fichier manquant pour type=file' });
        }

        const newContent = new Content(contentData);
        await newContent.save();

        res.status(201).json(newContent);
    } catch (err) {
        console.error('Erreur ajout contenu :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET - Récupérer les contenus d’un module
router.get('/module/:moduleId', async (req, res) => {
    try {
        const contents = await Content.find({ moduleId: req.params.moduleId });
        res.json(contents);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
