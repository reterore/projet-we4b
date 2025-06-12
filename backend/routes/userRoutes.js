const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// ✅ GET : un utilisateur par ID → doit être avant le .get('/')
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash');
        if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
        res.json(user);
    } catch (err) {
        console.error('❌ Erreur GET /users/:id :', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération de l’utilisateur' });
    }
});

// ✅ GET : tous les utilisateurs
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash');
        res.json(users);
    } catch (err) {
        console.error('❌ Erreur GET /users :', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des utilisateurs.' });
    }
});

// ✅ POST : inscription d’un utilisateur
router.post('/', async (req, res) => {
    try {
        const { surname, name, email, password, role } = req.body;

        if (!surname || !name || !email || !password || !role) {
            return res.status(400).json({ error: 'Tous les champs sont requis.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email déjà utilisé.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = new User({
            surname,
            name,
            email,
            passwordHash,
            role,
            selectedCourses: []
        });

        await newUser.save();
        res.status(201).json({ message: 'Utilisateur créé avec succès.' });
    } catch (error) {
        console.error('❌ Erreur POST /users :', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        res.status(500).json({ error: 'Erreur lors de la création de l’utilisateur.' });
    }
});

// ✅ PUT : mise à jour des cours sélectionnés
router.put('/:id/select-courses', async (req, res) => {
    try {
        const { selectedCourses } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { selectedCourses },
            { new: true }
        );
        res.json(updatedUser);
    } catch (error) {
        console.error('❌ Erreur PUT /users/:id/select-courses :', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour des cours sélectionnés.' });
    }
});

module.exports = router;
