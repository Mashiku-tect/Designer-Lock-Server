

 const { registerLimiter } = require('../middleware/RateLimiter');

const express = require("express");
const router = express.Router();
const authController = require("../controllers/RegisterController");


//registration URL
router.post("/register", registerLimiter,authController.register);

//verify email url
router.post("/verify-email",authController.verifySignupCode);

//resend sign Up verification Code
router.post("/resend-verification",authController.resendSignupCode);

module.exports = router;
