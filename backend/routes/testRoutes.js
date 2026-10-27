const express = require('express');
const router = express.Router();
const { generateTest } = require('../controllers/testController');
const auth = require('../middleware/authMiddleware');

router.get('/generate', auth, generateTest);

module.exports = router;