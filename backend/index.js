const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/we4b')
    .then(() => console.log('MongoDB connecté'))
    .catch(err => console.error(err));

app.get('/api/test', (req, res) => res.json({ message: 'API OK' }));

app.listen(3000, () => console.log('Serveur sur http://localhost:3000'));
