const mongoose = require('mongoose');
const Course = require('./models/Course');

mongoose.connect('mongodb://localhost:27017/we4b')
    .then(() => console.log('MongoDB connecté'))
    .catch(err => console.error(err));

const courses = [
    { title: 'Mathématiques', description: 'Algebra, géométrie...', teacherId: new mongoose.Types.ObjectId() },
    { title: 'Physique', description: 'Mécanique, thermodynamique...', teacherId: new mongoose.Types.ObjectId() },
    { title: 'Informatique', description: 'Programmation, réseaux...', teacherId: new mongoose.Types.ObjectId() },
    { title: 'Anglais', description: 'Grammaire et vocabulaire', teacherId: new mongoose.Types.ObjectId() },
    { title: 'Philosophie', description: 'Philosophie morale et politique', teacherId: new mongoose.Types.ObjectId() },
];

Course.insertMany(courses)
    .then(() => {
        console.log('Cours insérés avec succès');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Erreur lors de l\'insertion :', err);
        mongoose.connection.close();
    });
