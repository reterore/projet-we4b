const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token manquant ou mal formé' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET');
        req.user = decoded; // contient { userId, role }
        next();
    } catch (err) {
        console.error('❌ JWT invalid:', err.message);
        return res.status(403).json({ error: 'Token invalide' });
    }
}

function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès interdit : admin uniquement' });
    }
    next();
}

module.exports = { verifyToken, requireAdmin };
