const Question = require('../models/Question');

exports.generateTest = async (req, res) => {
    try {
        // Fetch 5 random questions using MongoDB aggregation
        const questions = await Question.aggregate([{ $sample: { size: 5 } }]);

        if (!questions || questions.length === 0) {
            return res.status(404).json({ message: "No questions found in the database. Please seed questions first." });
        }

        // Remove the correct answer before sending to the client!
        const sanitizedQuestions = questions.map(q => ({
            _id: q._id,
            topic: q.topic,
            text: q.text,
            options: q.options
        }));

        res.json(sanitizedQuestions);
    } catch (error) {
        console.error("Test Generation Error:", error);
        res.status(500).json({ message: "Failed to generate test" });
    }
};