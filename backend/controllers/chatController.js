const ragService = require('../services/ragService');
const ChatSession = require('../models/ChatSession');

exports.askQuestion = async (req, res) => {
    try {
        const { query, sessionId } = req.body;
        if (!query) return res.status(400).json({ message: "Query is required" });

        let session;
        let history = [];

        // Load existing session or create a new one
        if (sessionId) {
            session = await ChatSession.findOne({ _id: sessionId, userId: req.user.userId });
            if (!session) return res.status(404).json({ message: "Session not found or unauthorized" });

            // Get the last 4 messages for context
            history = session.messages.slice(-4);
        } else {
            // Create new session with a generated title
            const title = query.length > 30 ? query.substring(0, 30) + '...' : query;
            session = new ChatSession({ userId: req.user.userId, title, messages: [] });
        }

        session.messages.push({ role: 'user', content: query });

        // Pass history to RAG service
        const result = await ragService.generateAnswer(query, history);

        session.messages.push({
            role: 'assistant',
            content: result.answer,
            sources: [...new Set(result.sources)]
        });

        await session.save();

        res.json({
            answer: result.answer,
            sources: [...new Set(result.sources)],
            sessionId: session._id // Return ID so frontend can append it to subsequent requests
        });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ message: "Failed to generate answer" });
    }
};

exports.getSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ userId: req.user.userId })
            .select('-messages') // Don't load all messages for the sidebar list
            .sort({ updatedAt: -1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch sessions" });
    }
};

exports.getSessionById = async (req, res) => {
    try {
        const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user.userId });
        if (!session) return res.status(404).json({ message: "Session not found" });
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch session details" });
    }
};