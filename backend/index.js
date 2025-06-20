require('dotenv').config(); // ⚠️ Doit être tout en haut

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const assignmentRoutes = require('./routes/assignments');


const app = express();

// 🌍 Middleware CORS pour frontend Angular
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));

// 📦 Middleware pour body JSON
app.use(express.json());

// 🔌 Connexion MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/we4b';

mongoose.connect(mongoUri)
    .then(() => console.log('✅ Connecté à MongoDB'))
    .catch(err => {
        console.error('❌ Échec de connexion MongoDB :', err);
        process.exit(1); // Stop le serveur si DB cassée
    });

// 📁 Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/contents', require('./routes/contentRoutes'));
app.use('/api/logs', require('./routes/logs')); // ⬅️ Pour ton logger
app.use('/api/modules', require('./routes/modules'));
app.use('/api/forums', require('./routes/forum'));
app.use('/uploads', express.static('uploads'));
app.use('/api/assignments', assignmentRoutes);
app.use('/uploads/assignments', express.static('uploads/assignments'));
app.use('/api/assignments', require('./routes/assignments'));


// ✅ Route de test
app.get('/api/test', (req, res) => {
    res.json({ message: '✅ API opérationnelle' });
});

// 🚀 Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur backend prêt : http://localhost:${PORT}`);
});
