const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

router.post('/login', async (req, res) => {
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

    res.json({ token, user: { username: user.username, role: user.role } });
});

router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(409).json({ error: 'Utilisateur déjà existant' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, passwordHash, role });
    await newUser.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès' });
});


module.exports = router;
