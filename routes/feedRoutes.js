const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const authenticate = require('../middleware/authMiddleware'); // example auth middleware

router.get('/feed', authenticate, feedController.getFeed);

router.get('/designers/works/:id',authenticate, feedController.getDesignerWorks);

//get designer stats
router.get('/designers/stats/:id', feedController.getDesignerStats);

//folow a designer
router.post('/designers/toggle-follow/:followingId', authenticate, feedController.toggleFollowDesigner);

//get designer info by an ID
router.get('/getdesignerinfo/:id',feedController.getDesignerById);

//search for a designer
router.get('/search/designers', authenticate, feedController.searchDesigners);

//check profile ownership
router.get('/profile/check-ownership/:user_id', authenticate, feedController.checkProfileOwnership);

router.delete('/posts/delete/:postid',authenticate,feedController.DeletePost);


module.exports = router;
