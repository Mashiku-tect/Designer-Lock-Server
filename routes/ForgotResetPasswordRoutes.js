 const { registerLimiter } = require('../middleware/RateLimiter');

const express = require("express");
const router = express.Router();
const ResetPasswordController = require("../controllers/ForgotPasswordController");


//send OTP 
router.post("/forgot-password",ResetPasswordController.sendForgotPasswordCode);

//resend OTP
router.post("/verify-reset-code",ResetPasswordController.resendForgotPasswordCode);

//verify token
router.post("/resend-reset-code",ResetPasswordController.verifyForgotPasswordCode);

//change password
router.post("/reset-password",ResetPasswordController.resetPassword)

module.exports = router;