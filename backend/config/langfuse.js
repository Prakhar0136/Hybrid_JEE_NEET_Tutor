
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { LangfuseSpanProcessor } = require('@langfuse/otel');
const { startObservation } = require('@langfuse/tracing');

const langfuseSpanProcessor = new LangfuseSpanProcessor({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_BASE_URL || process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
    environment: process.env.NODE_ENV || 'development',
});

const sdk = new NodeSDK({
    spanProcessors: [langfuseSpanProcessor],
});

sdk.start();

module.exports = {
    startObservation,
    langfuseSpanProcessor,
    sdk,
};
