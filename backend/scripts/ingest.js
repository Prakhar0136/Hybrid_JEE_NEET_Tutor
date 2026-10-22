require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { pipeline } = require('@xenova/transformers');
const { FaissStore } = require('@langchain/community/vectorstores/faiss');

// Custom Embeddings class to bridge Xenova (local MiniLM) with LangChain
class LocalMiniLMEmbeddings {
    constructor() {
        this.extractor = null;
    }

    async init() {
        if (!this.extractor) {
            console.log('Loading MiniLM model locally...');
            this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }
    }

    async embedDocuments(texts) {
        await this.init();
        const embeddings = [];
        for (const text of texts) {
            const output = await this.extractor(text, { pooling: 'mean', normalize: true });
            embeddings.push(Array.from(output.data));
        }
        return embeddings;
    }

    async embedQuery(text) {
        await this.init();
        const output = await this.extractor(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }
}

async function ingestPDF(fileName) {
    const filePath = path.join(__dirname, '../data', fileName);

    console.log(`1. Extracting text from ${fileName}...`);
    const dataBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: dataBuffer });

    let rawText;

    try {
        const pdfData = await parser.getText();
        rawText = pdfData.text;
    } finally {
        await parser.destroy();
    }

    console.log(`2. Chunking text...`);
    // Split into ~500 character chunks with 50 character overlap to maintain context
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
    });

    const docs = await splitter.createDocuments([rawText], [{ source: fileName }]);
    console.log(`Created ${docs.length} chunks.`);

    console.log(`3. Generating Embeddings and Saving to FAISS...`);
    const embeddings = new LocalMiniLMEmbeddings();

    // Create Vector Store from the chunks
    const vectorStore = await FaissStore.fromDocuments(docs, embeddings);

    // Save the FAISS index to a local directory
    const saveDirectory = path.join(__dirname, '../vector_store');
    await vectorStore.save(saveDirectory);

    console.log('✅ Ingestion complete! FAISS index saved to /vector_store');
}

// Run the script
ingestPDF('physics_ch1.pdf').catch(console.error);