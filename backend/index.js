const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Middleware JSON
app.use(express.json());

// ✅ Middleware CORS
app.use(cors({
    origin: 'http://localhost:4200', // ← adapte à ton frontend si besoin
    credentials: true
}));

// ✅ Connexion MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/we4b', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ Connexion MongoDB réussie'))
    .catch(err => {
        console.error('❌ Erreur de connexion MongoDB :', err);
        process.exit(1); // Stoppe le serveur si la DB échoue
    });

// ✅ Importation des routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courseRoutes');
const userRoutes = require('./routes/userRoutes');
const contentRoutes = require('./routes/contentRoutes');

// ✅ Définition des routes API
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/modules', require('./routes/modules'));

// ✅ Route de test
app.get('/api/test', (req, res) => {
    res.json({ message: '✅ API opérationnelle' });
});

// ✅ Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
