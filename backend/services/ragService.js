const { FaissStore } = require('@langchain/community/vectorstores/faiss');
const { pipeline } = require('@xenova/transformers');
const path = require('path');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Reusing the Embeddings class from Day 2
class LocalMiniLMEmbeddings {
    constructor() { this.extractor = null; }
    async init() {
        if (!this.extractor) {
            this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }
    }
    async embedQuery(text) {
        await this.init();
        const output = await this.extractor(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }
}

let vectorStore = null;
let crossEncoder = null;
const embeddings = new LocalMiniLMEmbeddings();

async function initRAG() {
    if (!vectorStore) {
        const storePath = path.join(__dirname, '../vector_store');
        vectorStore = await FaissStore.load(storePath, embeddings);
    }
    if (!crossEncoder) {
        // Cross-Encoder for Stage 2 Reranking
        crossEncoder = await pipeline('text-classification', 'Xenova/ms-marco-MiniLM-L-6-v2');
    }
}

exports.generateAnswer = async (query, history = []) => {
    await initRAG();

    // Stage 1: Fast Retrieval (Get top 10 chunks via FAISS)
    const top10Docs = await vectorStore.similaritySearch(query, 10);

    // Stage 2: Reranking (Score each query-chunk pair via Cross-Encoder)
    const scoredDocs = await Promise.all(top10Docs.map(async (doc) => {
        const result = await crossEncoder([query, doc.pageContent]);
        const score = result[0]?.score || 0;
        return { ...doc, score };
    }));

    // Sort by highest score and take top 3
    scoredDocs.sort((a, b) => b.score - a.score);
    const top3Docs = scoredDocs.slice(0, 3);

    const contextText = top3Docs.map((doc, i) => `[Source ${i + 1}]: ${doc.pageContent}`).join('\n\n');

    // Format history for Groq (limit to last 4 messages to save tokens)
    const formattedHistory = Array.isArray(history)
        ? history.slice(-4).map(msg => ({
            role: msg.role,
            content: msg.content
        }))
        : [];

    const systemPrompt = `You are an expert JEE/NEET AI Tutor. 
Answer the user's question based strictly on the provided NCERT context. 
If the user asks in Hinglish, respond in Hinglish.
If the answer is not in the context, say "I don't have enough information in the NCERT syllabus to answer this."
Provide answers formatted in Markdown. Use LaTeX for math equations.

Context:
${contextText}`;

    const completion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            ...formattedHistory,
            { role: 'user', content: query }
        ],
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
        temperature: 0.2,
    });

    return {
        answer: completion.choices[0]?.message?.content || "Error generating answer.",
        sources: top3Docs.map(doc => doc.metadata.source)
    };
};