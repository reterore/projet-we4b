const express = require('express');
const router = express.Router();
const Forum = require('../models/forum');

// Créer un forum
router.post('/', async (req, res) => {
    try {
        const forum = new Forum(req.body);
        await forum.save();
        res.status(201).json(forum);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Récupérer tous les forums
router.get('/', async (req, res) => {
    const forums = await Forum.find().populate('courseId');
    res.json(forums);
});

// Ajouter un message à un forum
router.post('/:id/messages', async (req, res) => {
    const forum = await Forum.findById(req.params.id);
    if (!forum) return res.status(404).json({ error: "Forum non trouvé" });

    forum.messages.push(req.body);
    await forum.save();
    res.status(200).json(forum);
});

// Tous les forums liés à un cours
router.get('/by-course/:courseId', async (req, res) => {
    try {
        const forums = await Forum.find({ courseId: req.params.courseId });
        res.json(forums);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
