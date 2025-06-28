const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Forum = require('../models/forum');

router.post('/', async (req, res) => {
    try {
        const { title, courseId } = req.body;

        if (!title || !courseId) {
            return res.status(400).json({ error: 'Titre et courseId requis.' });
        }

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ error: 'courseId invalide.' });
        }

        const forum = new Forum({
            title,
            courseId,
            messages: []
        });

        await forum.save();
        res.status(201).json(forum);
    } catch (err) {
        console.error('❌ Erreur POST /forums :', err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

router.get('/', async (req, res) => {
    try {
        const forums = await Forum.find().populate('courseId');
        res.json(forums);
    } catch (err) {
        console.error('❌ Erreur GET /forums :', err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

router.post('/:id/messages', async (req, res) => {
    const forumId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(forumId)) {
        return res.status(400).json({ error: 'ID forum invalide.' });
    }

    const { author, content, timestamp } = req.body;

    if (!author || !content || !timestamp) {
        return res.status(400).json({ error: 'Champs du message manquants.' });
    }

    try {
        const forum = await Forum.findById(forumId);
        if (!forum) {
            return res.status(404).json({ error: 'Forum non trouvé.' });
        }

        forum.messages.push({ author, content, timestamp });
        await forum.save();

        res.status(200).json(forum);
    } catch (err) {
        console.error(`❌ Erreur POST /forums/${forumId}/messages :`, err);
        res.status(500).json({ error: 'Erreur ajout message.' });
    }
});

router.get('/by-course/:courseId', async (req, res) => {
    const courseId = req.params.courseId;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ error: 'ID de cours invalide.' });
    }

    try {
        const forums = await Forum.find({ courseId }).sort({ createdAt: 1 });
        res.json(forums);
    } catch (err) {
        console.error(`❌ Erreur GET /forums/by-course/${courseId} :`, err);
        res.status(500).json({ error: 'Erreur chargement forums par cours.' });
    }
});

module.exports = router;
