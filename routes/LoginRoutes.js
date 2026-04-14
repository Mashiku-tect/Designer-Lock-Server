const { loginLimiter } = require('../middleware/RateLimiter');

const express = require('express');
const router = express.Router();
const authController = require('../controllers/LoginController');

// POST /api/login
router.post('/login',loginLimiter, authController.login);

module.exports = router;
