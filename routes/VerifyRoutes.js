// routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
