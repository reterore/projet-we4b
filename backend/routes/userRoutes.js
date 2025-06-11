const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash'); // sans le hash
        if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT pour mettre à jour les cours sélectionnés par un utilisateur
router.put('/:id/select-courses', async (req, res) => {
    try {
        const userId = req.params.id;
        const { selectedCourses } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { selectedCourses },
            { new: true }
        );

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour des cours sélectionnés' });
    }
});

module.exports = router;
