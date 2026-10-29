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



exports.generateFlashcards = async (req, res) => {
    try {
        // 1. Fetch the user's five most recent test submissions
        const submissions = await TestSubmission.find({
            userId: req.user.userId
        })
            .sort({ createdAt: -1 })
            .limit(5);

        // 2. Collect unique weak topics
        const weakTopicsSet = new Set();

        submissions.forEach(sub => {
            sub.weakTopics.forEach(topic => {
                weakTopicsSet.add(topic);
            });
        });

        const topics = Array.from(weakTopicsSet);

        const targetTopics = topics.length > 0
            ? topics.join(', ')
            : 'Physics and Chemistry basics';

        // 3. Construct the prompt
        const prompt = `
Act as an expert JEE/NEET tutor.

Create exactly 5 high-yield revision flashcards
for these topics: ${targetTopics}.

Return ONLY a valid JSON array.
Do not include Markdown or code fences.

Each flashcard must have exactly these two fields:
- "front": A concept or question.
- "back": A concise explanation or answer.

Use this format:
[
    {
        "front": "Concept or Question",
        "back": "Brief explanation or answer"
    }
]
        `.trim();

        // 4. Generate flashcards using Groq
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert JEE/NEET tutor. Generate accurate, concise revision flashcards and follow the requested JSON format exactly.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
            temperature: 0.5,
        });

        // 5. Extract the model's response
        let rawText = completion.choices[0]?.message?.content || '';

        // Remove Markdown code fences if the model includes them
        rawText = rawText
            .trim()
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/, '')
            .trim();

        // 6. Parse and validate the JSON response
        const flashcards = JSON.parse(rawText);

        if (
            !Array.isArray(flashcards) ||
            flashcards.length !== 5 ||
            !flashcards.every(
                card =>
                    card &&
                    typeof card.front === 'string' &&
                    typeof card.back === 'string'
            )
        ) {
            throw new Error('Groq returned an invalid flashcard format');
        }

        // 7. Send the flashcards to the frontend
        return res.json(flashcards);

    } catch (error) {
        console.error('Flashcard Generation Error:', error);
        return res.status(500).json({
            message: 'Failed to generate flashcards'
        });
    }
};
