// controllers/authController.js
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "No account with that email" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

   // const resetLink = `https://4494d8ffd93a.ngrok-free.app/api/reset/${resetToken}`;
   const resetLink = `myapp://reset/${resetToken}`;

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mashikuallen@gmail.com",
        pass: "jula ugvx etga qbyp",
      },
    });

    await transporter.sendMail({
      from: "mashikuallen@gmail.com",
      to: user.email,
      subject: "Password Reset",
      text: `Click the following link to reset your password: ${resetLink}`,
    });

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
