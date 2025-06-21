const Assignment = require('../models/Assignment');

exports.getAssignmentsByStudent = async (req, res) => {
    const studentId = req.params.studentId;
    console.log("📥 Requête pour devoirs de l'étudiant :", studentId);

    try {
        const assignments = await Assignment.find()
            .populate('moduleId')
            .populate('courseId');

        console.log("✅ Assignments récupérés :", assignments.length);

        const filtered = assignments
            .map(assignment => {
                const submission = assignment.submissions.find(
                    sub => sub.studentId.toString() === studentId
                );

                if (submission) {
                    return {
                        title: assignment.title,
                        courseTitle: assignment.courseId?.title || 'N/A',
                        moduleTitle: assignment.moduleId?.title || 'N/A',
                        submission,
                    };
                }

                return null;
            })
            .filter(a => a !== null);

        console.log("✅ Assignments filtrés :", filtered.length);
        res.json(filtered);
    } catch (err) {
        console.error("❌ ERREUR getAssignmentsByStudent :", err.message, err.stack);
        res.status(500).send({ error: "Erreur serveur lors de la récupération des devoirs" });
    }
};

