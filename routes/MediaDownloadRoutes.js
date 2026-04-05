const express=require('express');
const router=express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {getAllImages}=require('../controllers/MediaDownloadController');


router.get('/images/:productid',verifyToken,getAllImages);
 module.exports=router;