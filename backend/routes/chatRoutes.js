const express = require('express');
const router = express.Router();
const { askQuestion, getSessions, getSessionById } = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, askQuestion);
router.get('/sessions', auth, getSessions);
router.get('/sessions/:id', auth, getSessionById);

module.exports = router;