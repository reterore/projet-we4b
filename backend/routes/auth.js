const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔐 Connexion (login)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier existence utilisateur
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé' });
        }

        // Vérifier mot de passe
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Mot de passe invalide' });
        }

        // Créer JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role }, // 👈 Bien inclure le rôle
            process.env.JWT_SECRET || 'SECRET',
            { expiresIn: '1d' }
        );

        // Réponse avec token et infos utiles
        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('❌ Erreur lors du login :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// 📝 Inscription (register)
router.post('/register', async (req, res) => {
    try {
        const { name, surname, email, password, role } = req.body;

        if (!name || !surname || !email || !password || !role) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        // Vérifier si l'email existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Utilisateur déjà existant' });
        }

        // Hasher le mot de passe
        const passwordHash = await bcrypt.hash(password, 10);

        // Créer et sauvegarder
        const newUser = new User({ name, surname, email, passwordHash, role });
        await newUser.save();

        res.status(201).json({ message: 'Utilisateur inscrit avec succès' });
    } catch (err) {
        console.error('❌ Erreur lors de l\'inscription :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
