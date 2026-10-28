const express = require('express');
const router = express.Router();
const { generateTest, submitTest, getAnalytics } = require('../controllers/testController');
const auth = require('../middleware/authMiddleware');

router.get('/generate', auth, generateTest);
router.post('/submit', auth, submitTest);
router.get('/analytics', auth, getAnalytics);

module.exports = router;
