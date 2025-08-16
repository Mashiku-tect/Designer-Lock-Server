// routes/profile.js

const express = require('express');
const router = express.Router();
const { getProfile, updateProfile,uploadProfileImage } = require('../controllers/ProfileController');
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/ProfileImageMiddleware');

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/updateprofile', authenticateToken, updateProfile);
router.post('/profile/image', authenticateToken, upload.single('profileimage'), uploadProfileImage);

module.exports = router;
