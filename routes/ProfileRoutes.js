// routes/profile.js

const express = require('express');
const router = express.Router();
const { getProfile, updateProfile,uploadProfileImage,addUserSkill,removeUserSkill } = require('../controllers/ProfileController');
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/ProfileImageMiddleware');

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/updateprofile', authenticateToken, updateProfile);
router.post('/profile/image', authenticateToken, upload.single('profileimage'), uploadProfileImage);
router.put('/updateprofile/addskill', authenticateToken, addUserSkill); // New route for adding skills
router.delete('/updateprofile/deleteskill/:id',  removeUserSkill); // New route for removing skills

module.exports = router;
