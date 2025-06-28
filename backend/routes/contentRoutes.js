const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const Content = require('../models/Content');
const ContentProgress = require('../models/contentProgress'); // ❗ manquant dans ta version

const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

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
                path: req.file.path
            };
        } else {
            return res.status(400).json({ error: 'Fichier manquant pour type=file' });
        }

        const newContent = new Content(contentData);
        await newContent.save();
        res.status(201).json(newContent);
    } catch (err) {
        console.error('❌ Erreur ajout contenu :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.get('/module/:moduleId', async (req, res) => {
    try {
        const contents = await Content.find({ moduleId: req.params.moduleId });
        res.json(contents);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.delete('/:id', async (req, res) => {
    const contentId = req.params.id;

    try {
        const content = await Content.findById(contentId);
        if (!content) {
            return res.status(404).json({ error: 'Contenu déjà supprimé ou inexistant' });
        }

        await Content.deleteOne({ _id: contentId });

        // Suppression des progressions associées
        await ContentProgress.deleteMany({ contentId });

        // Supprimer le fichier si c'était un fichier
        if (content.type === 'file' && content.file?.path && fs.existsSync(content.file.path)) {
            fs.unlinkSync(content.file.path);
        }

        res.json({ message: 'Contenu supprimé avec succès' });
    } catch (err) {
        console.error('❌ Erreur suppression contenu :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { title, text } = req.body;
        const updated = await Content.findByIdAndUpdate(
            req.params.id,
            { title, text },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Contenu non trouvé' });
        res.json(updated);
    } catch (err) {
        console.error('❌ Erreur modification contenu :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
