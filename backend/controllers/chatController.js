const ragService = require('../services/ragService');

exports.askQuestion = async (req, res) => {
    try {
        const { query, history } = req.body;
        if (!query) {
            return res.status(400).json({ message: "Query is required" });
        }

        const result = await ragService.generateAnswer(query, history);

        res.json({
            answer: result.answer,
            sources: [...new Set(result.sources)] // Unique source files
        });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ message: "Failed to generate answer" });
    }
};