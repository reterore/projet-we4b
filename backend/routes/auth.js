const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, email, passwordHash, role });
    await user.save();
    res.json({ message: 'Inscription réussie' });
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, 'SECRET', { expiresIn: '1d' });
    res.json({ token, user: { username: user.username, role: user.role } });
});

module.exports = router;
