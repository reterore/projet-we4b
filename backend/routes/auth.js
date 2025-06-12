const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

// 🔐 Connexion
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' });

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(401).json({ error: 'Mot de passe invalide' });

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'SECRET',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                surname: user.surname,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Erreur login:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// 📝 Inscription
router.post('/register', async (req, res) => {
    try {
        const { name, surname, email, password, role } = req.body;

        if (!name || !surname || !email || !password || !role) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Utilisateur déjà existant' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = new User({ name, surname, email, passwordHash, role });
        await newUser.save();

        res.status(201).json({ message: 'Utilisateur créé avec succès' });
    } catch (err) {
        console.error('Erreur register:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
