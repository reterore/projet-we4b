require('dotenv').config(); // ⚠️ À mettre tout en haut

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));

app.use(express.json());

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/we4b';

mongoose.connect(mongoUri)
    .then(() => console.log('✅ Connecté à MongoDB'))
    .catch(err => {
        console.error('❌ Erreur de connexion MongoDB :', err);
        process.exit(1); // Stopper si la DB ne répond pas
    });


app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/modules', require('./routes/modules'));
app.use('/api/contents', require('./routes/contentRoutes'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/forums', require('./routes/forum'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/progress', require('./routes/progress'));



app.use('/uploads', express.static('uploads'));
app.use('/uploads/assignments', express.static('uploads/assignments'));


app.get('/api/test', (req, res) => {
    res.json({ message: '✅ API opérationnelle' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
});
