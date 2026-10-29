const express = require('express');
const router = express.Router();
const { generateStudyPlan, generateFlashcards } = require('../controllers/aiController');
const auth = require('../middleware/authMiddleware');

router.get('/study-plan', auth, generateStudyPlan);
router.get('/flashcards', auth, generateFlashcards);
module.exports = router;