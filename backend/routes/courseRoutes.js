const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().populate('teacherId', 'name surname');
        res.json(courses);
    } catch (err) {
        console.error('Erreur lors de la récupération des cours :', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des cours' });
    }
});

// ✅ GET one course by ID with teacher info
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('teacherId', 'name surname');
        if (!course) {
            return res.status(404).json({ error: 'Cours non trouvé' });
        }
        res.json(course);
    } catch (err) {
        console.error('Erreur lors de la récupération du cours :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ✅ POST create a course
router.post('/', async (req, res) => {
    try {
        const { title, description, teacherId } = req.body;
        const newCourse = new Course({ title, description, teacherId });
        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (err) {
        console.error('Erreur lors de la création du cours :', err);
        res.status(500).json({ error: 'Erreur lors de la création du cours' });
    }
});

// ✅ PUT update course by ID
router.put('/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        }).populate('teacherId', 'name surname');

        if (!course) {
            return res.status(404).json({ error: 'Cours non trouvé pour mise à jour' });
        }

        res.json(course);
    } catch (err) {
        console.error('Erreur lors de la mise à jour du cours :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ✅ DELETE course by ID
router.delete('/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Cours non trouvé pour suppression' });
        }
        res.status(204).end();
    } catch (err) {
        console.error('Erreur lors de la suppression du cours :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
