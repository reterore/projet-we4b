const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const multer = require('multer');
const path = require('path');


// ✅ Créer un devoir (enseignant)
router.post('/', async (req, res) => {
    try {
        const { title, description, dueDate, courseId } = req.body;
        const assignment = new Assignment({
            title,
            description,
            dueDate,
            courseId,
            submissions: []
        });
        await assignment.save();
        res.status(201).json(assignment);
    } catch (error) {
        console.error('Erreur création devoir :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ✅ Récupérer les devoirs d’un cours
router.get('/course/:courseId', async (req, res) => {
    try {
        const assignments = await Assignment.find({ courseId: req.params.courseId });
        res.json(assignments);
    } catch (error) {
        console.error('Erreur récupération devoirs :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Configuration de multer
const storage = multer.diskStorage({
    destination: 'uploads/assignments/',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

module.exports = router;

// POST - Soumettre un devoir (étudiant)
router.post('/:assignmentId/submit', upload.single('file'), async (req, res) => {
    try {
        const { studentId, studentName } = req.body;
        const assignment = await Assignment.findById(req.params.assignmentId);
        if (!assignment) {
            return res.status(404).json({ error: 'Devoir introuvable' });
        }

        const newSubmission = {
            studentId,
            studentName,
            file: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                path: req.file.path,
            },
            status: 'submitted',
            grade: null,
            comment: null,
            submittedAt: new Date(),
        };

        assignment.submissions.push(newSubmission);
        await assignment.save();

        res.status(201).json({ message: 'Soumission enregistrée', assignment });
    } catch (err) {
        console.error('Erreur lors de la soumission :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
