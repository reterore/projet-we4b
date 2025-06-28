const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Course = require('./models/Course');
const User = require('./models/User');
const Content = require('./models/Content'); // ✅ Ajouté pour les modules

mongoose.connect('mongodb://localhost:27017/we4b')
    .then(() => console.log('✅ MongoDB connecté'))
    .catch(err => console.error('❌ Erreur connexion MongoDB :', err));

(async () => {
    try {
        const existingAdmin = await User.findOne({ email: 'admin@we4b.com' });
        let admin;

        if (existingAdmin) {
            console.log('Admin déjà existant :', existingAdmin.email);
            admin = existingAdmin;
        } else {
            const passwordHash = await bcrypt.hash('admin123', 10);
            admin = new User({
                surname: 'Admin',
                name: 'Principal',
                email: 'admin@we4b.com',
                passwordHash,
                role: 'admin'
            });
            const savedAdmin = await admin.save();
            console.log('Nouvel admin inséré :', savedAdmin.email);
        }

        // Création des cours si aucun n'existe
        const courseCount = await Course.countDocuments();
        let mathCourse;
        if (courseCount > 0) {
            console.log('📚 Les cours existent déjà. Aucun ajout effectué.');
            mathCourse = await Course.findOne({ title: 'Mathématiques' }); // 🔍 utile pour les contenus
        } else {
            const courses = [
                { title: 'Mathématiques', description: 'Algebra, géométrie...', teacherId: admin._id },
                { title: 'Physique', description: 'Mécanique, thermodynamique...', teacherId: admin._id },
                { title: 'Informatique', description: 'Programmation, réseaux...', teacherId: admin._id },
                { title: 'Anglais', description: 'Grammaire et vocabulaire', teacherId: admin._id },
                { title: 'Philosophie', description: 'Philosophie morale et politique', teacherId: admin._id },
            ];
            const insertedCourses = await Course.insertMany(courses);
            console.log('Cours insérés avec succès');
            mathCourse = insertedCourses.find(c => c.title === 'Mathématiques');
        }


    } catch (err) {
        console.error('❌ Erreur lors de l\'insertion :', err);
    } finally {
        mongoose.connection.close();
    }
})();
