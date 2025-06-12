const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Course = require('./models/Course');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/we4b')
    .then(() => console.log('✅ MongoDB connecté'))
    .catch(err => console.error('❌ Erreur connexion MongoDB :', err));

(async () => {
    try {
        // Création d’un admin
        const passwordHash = await bcrypt.hash('admin123', 10); // mot de passe sécurisé
        const admin = new User({
            surname: 'Admin',
            name: 'Principal',
            email: 'admin@we4b.com',
            passwordHash,
            role: 'admin'
        });

        const savedAdmin = await admin.save();
        console.log('👑 Admin inséré avec succès :', savedAdmin.email);

        // Création de cours avec l’admin comme prof par défaut
        const courses = [
            { title: 'Mathématiques', description: 'Algebra, géométrie...', teacherId: savedAdmin._id },
            { title: 'Physique', description: 'Mécanique, thermodynamique...', teacherId: savedAdmin._id },
            { title: 'Informatique', description: 'Programmation, réseaux...', teacherId: savedAdmin._id },
            { title: 'Anglais', description: 'Grammaire et vocabulaire', teacherId: savedAdmin._id },
            { title: 'Philosophie', description: 'Philosophie morale et politique', teacherId: savedAdmin._id },
        ];

        await Course.insertMany(courses);
        console.log('📚 Cours insérés avec succès');

    } catch (err) {
        console.error('❌ Erreur lors de l\'insertion :', err);
    } finally {
        mongoose.connection.close();
    }
})();
