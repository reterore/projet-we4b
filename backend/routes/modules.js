const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const Content = require('../models/content');
const ContentProgress = require('../models/contentProgress');

// ➕ Créer un module
router.post('/', async (req, res) => {
    try {
        const { title, courseId } = req.body;
        if (!title || !courseId) return res.status(400).json({ error: 'Champs requis manquants' });

        const newModule = new Module({ title, courseId });
        const saved = await newModule.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error('❌ Erreur création module :', err);
        res.status(500).json({ error: 'Erreur création module' });
    }
});

// 📥 Obtenir tous les modules d’un cours
router.get('/course/:courseId', async (req, res) => {
    try {
        const modules = await Module.find({ courseId: req.params.courseId });
        res.json(modules);
    } catch (err) {
        console.error('❌ Erreur récupération modules :', err);
        res.status(500).json({ error: 'Erreur récupération modules' });
    }
});

// ✏️ Modifier un module
router.put('/:id', async (req, res) => {
    try {
        const updated = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Module non trouvé' });
        res.json(updated);
    } catch (err) {
        console.error('❌ Erreur modification module :', err);
        res.status(500).json({ error: 'Erreur modification module' });
    }
});

// ❌ Supprimer un module (pas de suppression en cascade ici)
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Module.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Module non trouvé' });

        res.json({ message: 'Module supprimé avec succès' });
    } catch (err) {
        console.error('❌ Erreur suppression module :', err);
        res.status(500).json({ error: 'Erreur suppression module' });
    }
});

// 📊 Récupérer la progression d’un étudiant pour un module
router.get('/progress/:studentId/:moduleId', async (req, res) => {
    const { studentId, moduleId } = req.params;

    try {
        const contents = await Content.find({ moduleId }).select('_id');
        const total = contents.length;
        const contentIds = contents.map(c => c._id);

        const seen = await ContentProgress.countDocuments({
            studentId,
            contentId: { $in: contentIds },
            isViewed: true
        });

        const percentage = total === 0 ? 0 : Math.min(100, Math.round((seen / total) * 100));

        res.json({ total, seen, percentage });
    } catch (err) {
        console.error('❌ Erreur calcul progression :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
