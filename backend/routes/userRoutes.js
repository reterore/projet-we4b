const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// ✅ GET : un utilisateur par ID
router.get('/:id', async (req, res) => {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "ID utilisateur invalide." });
    }

    try {
        const user = await User.findById(userId).select('-passwordHash');
        if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
        res.json(user);
    } catch (err) {
        console.error('❌ Erreur GET /users/:id :', err);
        res.status(500).json({ error: "Erreur serveur lors de la récupération de l’utilisateur." });
    }
});

// ✅ GET tous les utilisateurs
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash');
        res.json(users);
    } catch (err) {
        console.error('❌ Erreur GET /users :', err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// ✅ POST création utilisateur
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

// ✅ PUT mise à jour des cours sélectionnés
router.put('/:id/select-courses', async (req, res) => {
    try {
        const { selectedCourses } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { selectedCourses },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error('❌ Erreur PUT /users/:id/select-courses :', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour des cours sélectionnés.' });
    }
});

// ✅ PUT mise à jour infos utilisateur
router.put('/:id', async (req, res) => {
    const { name, surname, email, role } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, surname, email, role },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        res.json(updatedUser);
    } catch (err) {
        console.error('❌ Erreur PUT /users/:id :', err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// ✅ DELETE utilisateur
router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }
        res.json({ message: 'Utilisateur supprimé avec succès.' });
    } catch (error) {
        console.error('❌ Erreur DELETE /users/:id :', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de l’utilisateur.' });
    }
});

// ✅ PATCH append un cours sans écraser les autres
router.patch('/:id/append-course', async (req, res) => {
    const userId = req.params.id;
    const { courseId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !courseId) {
        return res.status(400).json({ error: 'ID utilisateur ou courseId invalide.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

        if (!user.selectedCourses.includes(courseId)) {
            user.selectedCourses.push(courseId);
            await user.save();
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('❌ Erreur PATCH /users/:id/append-course :', error);
        res.status(500).json({ error: 'Erreur serveur lors de l’ajout du cours.' });
    }
});

module.exports = router;
