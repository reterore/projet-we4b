const express = require('express');
const router = express.Router();
const ContentProgress = require('../models/contentProgress');
const Content = require('../models/Content');

// 📊 GET - Récupérer le % de progression pour un module
router.get('/:studentId/:moduleId', async (req, res) => {
    const { studentId, moduleId } = req.params;
    try {
        const total = await Content.countDocuments({ moduleId });
        const seen = await ContentProgress.countDocuments({ studentId, moduleId });
        const percentage = total > 0 ? Math.round((seen / total) * 100) : 0;
        res.json({ total, seen, percentage });
    } catch (err) {
        console.error('❌ Erreur récupération progression :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// 👁️ GET - Vérifie si un contenu a été vu
router.get('/check/:studentId/:contentId', async (req, res) => {
    const { studentId, contentId } = req.params;
    try {
        const isViewed = await ContentProgress.exists({ studentId, contentId });
        res.json({ isViewed: !!isViewed });
    } catch (err) {
        console.error('❌ Erreur vérification contenu vu :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ✅ POST - Marquer un contenu comme vu
router.post('/view', async (req, res) => {
    const { studentId, contentId } = req.body;
    try {
        const existing = await ContentProgress.findOne({ studentId, contentId });
        if (!existing) {
            const content = await Content.findById(contentId);
            if (!content) return res.status(404).json({ error: 'Contenu introuvable' });

            await ContentProgress.create({
                studentId,
                contentId,
                moduleId: content.moduleId,
                isViewed: true
            });
        }
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('❌ Erreur enregistrement vue contenu :', err);
        res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement de la progression' });
    }
});

// ✅ Correction robuste
router.get('/:studentId/:moduleId', async (req, res) => {
    const { studentId, moduleId } = req.params;
    try {
        // Obtenir tous les contenus de ce module
        const contents = await Content.find({ moduleId }).select('_id');
        const contentIds = contents.map(c => c._id.toString());

        // Compter ceux vus
        const seen = await ContentProgress.countDocuments({
            studentId,
            contentId: { $in: contentIds }
        });

        const total = contentIds.length;
        const percentage = total > 0 ? Math.round((seen / total) * 100) : 0;

        res.json({ total, seen, percentage });
    } catch (err) {
        console.error('❌ Erreur récupération progression :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /progress/:studentId/:courseId
router.get('/:studentId/:courseId', async (req, res) => {
    const { studentId, courseId } = req.params;
    try {
        const modules = await Module.find({ courseId });
        const moduleIds = modules.map(m => m._id);

        let totalContents = 0;
        let totalViewed = 0;

        for (const moduleId of moduleIds) {
            const contentCount = await Content.countDocuments({ moduleId });
            const viewedCount = await ContentProgress.countDocuments({ moduleId, studentId });
            totalContents += contentCount;
            totalViewed += viewedCount;
        }

        const percentage = totalContents === 0 ? 0 : Math.round((totalViewed / totalContents) * 100);
        res.json({ courseId, percentage });
    } catch (err) {
        console.error('Erreur progression cours', err);
        res.status(500).json({ error: 'Erreur serveur progression cours' });
    }
});

module.exports = router;
