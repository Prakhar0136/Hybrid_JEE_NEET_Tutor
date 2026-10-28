const Question = require('../models/Question');
const TestSubmission = require('../models/TestSubmission');

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

exports.submitTest = async (req, res) => {
    try {
        const { submissionId, answers } = req.body;

        // 1. Idempotency Check: Did this user already submit this specific test?
        const existingSubmission = await TestSubmission.findOne({ submissionId, userId: req.user.userId });
        if (existingSubmission) {
            return res.status(200).json(existingSubmission); // Return early, don't rescore
        }

        // 2. Fetch the actual questions from DB to check answers securely
        const questionIds = Object.keys(answers);
        const questions = await Question.find({ _id: { $in: questionIds } });

        let score = 0;
        let incorrectTopics = new Set();

        questions.forEach((q) => {
            const userAnswerIndex = answers[q._id.toString()];
            if (userAnswerIndex === q.correctAnswerIndex) {
                score += 1;
            } else {
                incorrectTopics.add(q.topic);
            }
        });

        // 3. Save the submission
        const newSubmission = new TestSubmission({
            userId: req.user.userId,
            submissionId,
            score,
            totalQuestions: questions.length,
            weakTopics: Array.from(incorrectTopics)
        });

        await newSubmission.save();

        res.status(201).json(newSubmission);
    } catch (error) {
        console.error("Submit Test Error:", error);
        res.status(500).json({ message: "Failed to submit test" });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        // Fetch user's test history, sorted by newest
        const submissions = await TestSubmission.find({ userId: req.user.userId }).sort({ createdAt: -1 });

        // Calculate aggregate metrics
        const totalTests = submissions.length;
        let averageScore = 0;
        let allWeakTopics = {};

        if (totalTests > 0) {
            const totalScore = submissions.reduce((acc, sub) => acc + (sub.score / sub.totalQuestions), 0);
            averageScore = (totalScore / totalTests) * 100; // Percentage

            // Tally up weak topics
            submissions.forEach(sub => {
                sub.weakTopics.forEach(topic => {
                    allWeakTopics[topic] = (allWeakTopics[topic] || 0) + 1;
                });
            });
        }

        // Sort weak topics by frequency
        const topWeakTopics = Object.entries(allWeakTopics)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0])
            .slice(0, 3); // Top 3 weak areas

        res.json({
            recentSubmissions: submissions.slice(0, 10).reverse(), // Oldest to newest for charting
            metrics: {
                totalTests,
                averageScore: averageScore.toFixed(1),
                topWeakTopics
            }
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: "Failed to load analytics" });
    }
};