// routes/auth.js
const express = require("express");
const router = express.Router();
const forgotPassword  = require("../controllers/ForgotPasswordController");
const  resetPassword  = require("../controllers/ResetPasswordController");

router.post("/forgotpassword", forgotPassword.forgotPassword);
router.post("/reset/:token", resetPassword.resetPassword);

module.exports = router;
