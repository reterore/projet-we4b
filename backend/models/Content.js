
const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: String,
    description: String,
    fileUrl: String, // chemin ou URL du fichier
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    }
});

module.exports = mongoose.model('Content', contentSchema);
