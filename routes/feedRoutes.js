const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const authenticate = require('../middleware/authMiddleware'); // example auth middleware

router.get('/feed', authenticate, feedController.getFeed);

router.get('/designers/works/:id', feedController.getDesignerWorks);

module.exports = router;
