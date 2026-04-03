const express = require('express');
const router = express.Router();
const { toggleLike } = require('../controllers/LikesController');
const authenticate = require('../middleware/authMiddleware');

// POST /api/posts/:postId/toggle-like
router.post('/posts/toggle-like/:postId', authenticate, toggleLike);

module.exports = router;
