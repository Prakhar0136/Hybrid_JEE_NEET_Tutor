const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true },
    explanation: { type: String }
});

module.exports = mongoose.model('Question', questionSchema);