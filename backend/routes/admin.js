// Authentification inline dans admin.js
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token manquant' });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'SECRET');
        next();
    } catch (err) {
        res.status(403).json({ error: 'Token invalide' });
    }
}

function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Accès interdit' });
    }
    next();
}
