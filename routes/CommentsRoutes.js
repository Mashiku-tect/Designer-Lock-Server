const express = require('express');
const router = express.Router();
const commentController = require('../controllers/CommentsController');
const authenticate  = require('../middleware/authMiddleware');

router.post('/products/comments/:productId', authenticate, commentController.addCommentToProduct);

module.exports = router;
