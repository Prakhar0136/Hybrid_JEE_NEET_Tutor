const express = require('express');
const router = express.Router();
const { generateStudyPlan } = require('../controllers/aiController');
const auth = require('../middleware/authMiddleware');

router.get('/study-plan', auth, generateStudyPlan);

module.exports = router;