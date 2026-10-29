
const Groq = require('groq-sdk');
const TestSubmission = require('../models/TestSubmission');

const {
    startObservation,
    langfuseSpanProcessor,
} = require('../config/langfuse');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

const SYSTEM_PROMPT =
    'You are an expert JEE/NEET tutor who creates accurate, focused, actionable learning materials.';

// Flush traces so completed requests are sent promptly.
// Tracing failures should not change the API response.
async function flushTracing() {
    try {
        await langfuseSpanProcessor.forceFlush();
    } catch (error) {
        console.error('Langfuse Flush Error:', error.message);
    }
}

// Collect unique weak topics from the user's five most recent tests.
async function getWeakTopics(userId) {
    const submissions = await TestSubmission.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5);

    const weakTopicsSet = new Set();

    submissions.forEach((sub) => {
        (sub.weakTopics || []).forEach((topic) => {
            weakTopicsSet.add(topic);
        });
    });

    return Array.from(weakTopicsSet);
}

// Safely mark a failed generation in Langfuse.
function recordGenerationError(generation, error) {
    if (!generation) return;

    generation.update({
        level: 'ERROR',
        statusMessage: error.message || 'Generation failed',
    }).end();
}

// --------------------------------------------------
// Generate Study Plan
// --------------------------------------------------

exports.generateStudyPlan = async (req, res) => {
    const trace = startObservation(
        'Generate Study Plan',
        {
            userId: req.user.userId,
            tags: ['study-plan', 'production'],
            input: {
                feature: 'study-plan',
            },
        },
        { asType: 'span' }
    );

    let generation;
    let generationEnded = false;
    let traceOutput;
    let traceError;

    try {
        // 1. Gather weak topics
        const topics = await getWeakTopics(req.user.userId);

        if (topics.length === 0) {
            traceOutput = {
                message: 'No weak topics found',
            };

            return res.json({
                plan: "You're doing great! Take more tests to identify areas for improvement.",
            });
        }

        // 2. Construct the prompt
        const prompt = `
Act as an expert JEE/NEET tutor.
A student is struggling with these topics: ${topics.join(', ')}.

Create a highly actionable, concise 3-day study plan
to help them master these specific topics.

Include practical study techniques.
Format the output strictly in Markdown.
Keep it encouraging but direct.
        `.trim();

        // 3. Start a child generation for the Groq call
        generation = trace.startObservation(
            'Groq Study Plan Call',
            {
                model: MODEL,
                input: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: prompt },
                ],
                modelParameters: {
                    temperature: 0.5,
                },
            },
            { asType: 'generation' }
        );

        // 4. Call Groq
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt },
            ],
            model: MODEL,
            temperature: 0.5,
        });

        const plan =
            completion.choices[0]?.message?.content ||
            'Could not generate a study plan. Please try again.';

        // 5. Record output and usage in Langfuse
        generation.update({
            output: plan,
            usageDetails: completion.usage
                ? {
                    input: completion.usage.prompt_tokens,
                    output: completion.usage.completion_tokens,
                    total: completion.usage.total_tokens,
                }
                : undefined,
            metadata: {
                topicCount: topics.length,
            },
        }).end();

        generationEnded = true;

        traceOutput = {
            success: true,
            topicCount: topics.length,
        };

        return res.json({ plan });

    } catch (error) {
        traceError = error;

        recordGenerationError(generation, error);
        generationEnded = true;

        console.error('Study Plan Generation Error:', error);

        return res.status(500).json({
            message: 'Failed to generate study plan',
        });

    } finally {
        // Close any generation that was created but not yet ended.
        if (generation && !generationEnded) {
            generation.update({
                level: 'ERROR',
                statusMessage: traceError?.message || 'Request ended unexpectedly',
            }).end();
        }

        trace.update({
            output: traceOutput,
            ...(traceError && {
                level: 'ERROR',
                statusMessage: traceError.message,
            }),
        }).end();

        await flushTracing();
    }
};

// --------------------------------------------------
// Generate Flashcards
// --------------------------------------------------

exports.generateFlashcards = async (req, res) => {
    const trace = startObservation(
        'Generate Flashcards',
        {
            userId: req.user.userId,
            tags: ['flashcards', 'production'],
            input: {
                feature: 'flashcards',
                requestedCount: 5,
            },
        },
        { asType: 'span' }
    );

    let generation;
    let generationEnded = false;
    let traceOutput;
    let traceError;

    try {
        // 1. Gather weak topics
        const topics = await getWeakTopics(req.user.userId);

        const targetTopics = topics.length > 0
            ? topics.join(', ')
            : 'Physics and Chemistry basics';

        // 2. Construct the prompt
        const prompt = `
Act as an expert JEE/NEET tutor.

Create exactly 5 high-yield revision flashcards
for these topics: ${targetTopics}.

Return ONLY a valid JSON array.
Do not include Markdown or code fences.

Each object must have exactly two string fields:
- "front": A concept or question.
- "back": A concise explanation or answer.

Example structure:
[
  {
    "front": "Concept or Question",
    "back": "Brief explanation or answer"
  }
]
        `.trim();

        // 3. Start a child generation for the Groq call
        generation = trace.startObservation(
            'Groq Flashcard Generation',
            {
                model: MODEL,
                input: [
                    {
                        role: 'system',
                        content: `${SYSTEM_PROMPT} Return exactly five flashcards as a valid JSON array.`,
                    },
                    { role: 'user', content: prompt },
                ],
                modelParameters: {
                    temperature: 0.5,
                },
            },
            { asType: 'generation' }
        );

        // 4. Call Groq
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `${SYSTEM_PROMPT} Return exactly five flashcards as a valid JSON array.`,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: MODEL,
            temperature: 0.5,
        });

        // 5. Extract and clean the response
        let rawText = completion.choices[0]?.message?.content || '';

        rawText = rawText
            .trim()
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/, '')
            .trim();

        // 6. Parse and validate the generated JSON
        const flashcards = JSON.parse(rawText);

        if (
            !Array.isArray(flashcards) ||
            flashcards.length !== 5 ||
            !flashcards.every(
                (card) =>
                    card &&
                    typeof card.front === 'string' &&
                    typeof card.back === 'string'
            )
        ) {
            throw new Error('Groq returned an invalid flashcard format');
        }

        // 7. Record the successful generation
        generation.update({
            output: flashcards,
            usageDetails: completion.usage
                ? {
                    input: completion.usage.prompt_tokens,
                    output: completion.usage.completion_tokens,
                    total: completion.usage.total_tokens,
                }
                : undefined,
            metadata: {
                topicCount: topics.length,
                flashcardCount: flashcards.length,
            },
        }).end();

        generationEnded = true;

        traceOutput = {
            success: true,
            flashcardCount: flashcards.length,
        };

        // Preserve the original API response: a JSON array.
        return res.json(flashcards);

    } catch (error) {
        traceError = error;

        recordGenerationError(generation, error);
        generationEnded = true;

        console.error('Flashcard Generation Error:', error);

        return res.status(500).json({
            message: 'Failed to generate flashcards',
        });

    } finally {
        if (generation && !generationEnded) {
            generation.update({
                level: 'ERROR',
                statusMessage: traceError?.message || 'Request ended unexpectedly',
            }).end();
        }

        trace.update({
            output: traceOutput,
            ...(traceError && {
                level: 'ERROR',
                statusMessage: traceError.message,
            }),
        }).end();

        await flushTracing();
    }
};
