// routes/passwordReset.js
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const { User } = require("../models"); // adjust path if needed
const validator = require('validator'); 

const router = express.Router();

// Serve reset password page
router.get("/reset/:token", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/reset.html"));
});

// Handle password reset form submission
router.post("/reset-password", async (req, res) => {
  console.log('request is received in reset password controller')
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired password reset link" });
    }

    // Hash and save new password
    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successful! You Can Now Login in the App" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Forgot password route (send reset link)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "No account with that email" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
   // console.log('DAte time',Date.now());
    await user.save();

    const resetLink = `${process.env.SERVER_URL}/api/reset/${token}`; // change to your domain

    const transporter = nodemailer.createTransport({
      host: "smtppro.zoho.com",
      port: 465,            // 465 for SSL
      secure: true,        // true if using 465
      auth: {
        user: process.env.ZOHO_EMAIL_USER, // app1@mydomain.com
        pass: process.env.ZOHO_EMAIL_PASS, // Zoho App Password
      },
    });

    await transporter.sendMail({
      from: `"PixelProof" <${process.env.ZOHO_EMAIL_USER}>`,
      to: email,
      subject: "Password Reset",
      text: `Click the following link to reset your password: ${resetLink}`,
    });

    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
