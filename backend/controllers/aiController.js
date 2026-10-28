const Groq = require('groq-sdk');
const TestSubmission = require('../models/TestSubmission');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.generateStudyPlan = async (req, res) => {
    try {
        // 1. Gather the user's weak topics from recent tests
        const submissions = await TestSubmission.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(5);

        let weakTopicsSet = new Set();
        submissions.forEach(sub => {
            sub.weakTopics.forEach(topic => weakTopicsSet.add(topic));
        });

        const topics = Array.from(weakTopicsSet);

        if (topics.length === 0) {
            return res.json({ plan: "You're doing great! Take more tests to identify areas for improvement." });
        }

        // 2. Construct the prompt
        const prompt = `
Act as an expert JEE/NEET tutor. A student is struggling with the following topics: ${topics.join(', ')}.
Create a highly actionable, concise 3-day study plan to help them master these specific topics.
Include practical study techniques. Format the output strictly in Markdown. Keep it encouraging but direct.
        `.trim();

        // 3. Call Groq
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are an expert JEE/NEET tutor who creates focused, actionable study plans.' },
                { role: 'user', content: prompt }
            ],
            model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
            temperature: 0.5,
        });

        const plan = completion.choices[0]?.message?.content || 'Could not generate a study plan. Please try again.';
        res.json({ plan });

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ message: "Failed to generate study plan" });
    }
};
