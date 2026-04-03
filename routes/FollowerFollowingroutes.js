// routes/followRoutes.js
const express = require('express');
const router = express.Router();
const followController = require('../controllers/FollowerFollowingController');
const authenticate = require('../middleware/authMiddleware');

//router.get('/followfollower/:userId', followController.getFollowersAndFollowing);


//get followers or following by ID
router.get("/follower/:userId/following/:type",authenticate, followController.getUserFollows);
router.get("/designers/:userId/followers",authenticate, followController.getFollowers);
router.get("/designers/:userId/following",authenticate, followController.getFollowing);

module.exports = router;
