require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');

const sampleQuestions = [
    {
        topic: 'Physics',
        text: 'What is the SI unit of Force?',
        options: ['Joule', 'Newton', 'Pascal', 'Watt'],
        correctAnswerIndex: 1,
        explanation: 'Force is measured in Newtons (N) according to the International System of Units.'
    },
    {
        topic: 'Physics',
        text: 'In an isothermal process, which of the following remains constant?',
        options: ['Pressure', 'Volume', 'Temperature', 'Heat'],
        correctAnswerIndex: 2,
        explanation: 'Iso = same, thermal = temperature. Therefore, temperature remains constant.'
    },
    {
        topic: 'Chemistry',
        text: 'Which of the following is a noble gas?',
        options: ['Nitrogen', 'Oxygen', 'Argon', 'Chlorine'],
        correctAnswerIndex: 2,
        explanation: 'Argon is a Group 18 element, making it a noble gas.'
    },
    {
        topic: 'Mathematics',
        text: 'What is the derivative of sin(x) with respect to x?',
        options: ['-cos(x)', 'cos(x)', '-sin(x)', 'tan(x)'],
        correctAnswerIndex: 1,
        explanation: 'The derivative of sin(x) is cos(x).'
    },
    {
        topic: 'Biology',
        text: 'Which organelle is known as the powerhouse of the cell?',
        options: ['Ribosome', 'Nucleus', 'Mitochondria', 'Endoplasmic Reticulum'],
        correctAnswerIndex: 2,
        explanation: 'Mitochondria generate most of the chemical energy needed to power the cell (ATP).'
    }
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        await Question.deleteMany({});
        await Question.insertMany(sampleQuestions);
        console.log('✅ Seeded curated question bank!');
        process.exit();
    });