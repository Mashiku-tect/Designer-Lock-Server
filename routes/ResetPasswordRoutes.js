 const authmiddleware = require('../middleware/authMiddleware');

const express = require("express");
const router = express.Router();
const ResetPasswordController = require("../controllers/ResetPasswordController");


//registration URL
router.post("/send-password-change-code",authmiddleware,ResetPasswordController.sendResetPasswordCode);

//verify email url
router.post("/resend-password-change-code",authmiddleware,ResetPasswordController.resendResetPasswordCode);

//resend sign Up verification Code
router.post("/verify-password-change-code",authmiddleware,ResetPasswordController.verifyActionCode);



module.exports = router;