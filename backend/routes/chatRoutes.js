const express = require('express');
const router = express.Router();
const { askQuestion } = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, askQuestion);

module.exports = router;