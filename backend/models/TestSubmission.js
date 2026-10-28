const mongoose = require('mongoose');

const testSubmissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submissionId: { type: String, required: true }, // For idempotency
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    weakTopics: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure a user cannot submit the same test ID twice
testSubmissionSchema.index({ userId: 1, submissionId: 1 }, { unique: true });

module.exports = mongoose.model('TestSubmission', testSubmissionSchema);