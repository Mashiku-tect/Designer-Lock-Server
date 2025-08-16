// routes/designerRoutes.js
const express = require('express');
const router = express.Router();
const { getAllDesigners } = require('../controllers/DesignersController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/designers',authenticateToken, getAllDesigners);

module.exports = router;
