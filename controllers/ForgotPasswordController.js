const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { User } = require("../models");

exports.sendForgotPasswordCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const user = await User.findOne({ where: { email } });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      return res.json({
        success: true,
        message: "If this email exists, a reset code has been sent.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.forgotPasswordCode = hashedOtp;
    user.forgotPasswordExpires = expires;
    user.forgotPasswordUsed = false;
    user.forgotPasswordAttempts = 0;

    await user.save();

    const transporter = nodemailer.createTransport({
      host: "smtppro.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_EMAIL_USER,
        pass: process.env.ZOHO_EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"PixelProof" <${process.env.ZOHO_EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${otp}. It expires in 10 minutes.`,
    });

    return res.json({
      success: true,
      message: "If this email exists, a reset code has been sent.",
      userid:user.user_id
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong,please try again" });
  }
};


//resend OTP for forgotten password reset
exports.resendForgotPasswordCode = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findOne({ where: { user_id:userId } });

    if (!user) {
      return res.json({
        success: true,
        message: "If this email exists, a reset code has been sent.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.forgotPasswordCode = hashedOtp;
    user.forgotPasswordExpires = expires;
    user.forgotPasswordUsed = false;
    user.forgotPasswordAttempts = 0;

    await user.save();

    const transporter = nodemailer.createTransport({
      host: "smtppro.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_EMAIL_USER,
        pass: process.env.ZOHO_EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"PixelProof" <${process.env.ZOHO_EMAIL_USER}>`,
      to: user.email,
      subject: "New Password Reset Code",
      text: `Your new password reset code is: ${otp}. It expires in 10 minutes.`,
    });

    return res.json({
      success: true,
      message: "Code resent successfully",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


//Veify code sent to the user
const MAX_ATTEMPTS = 5;

exports.verifyForgotPasswordCode = async (req, res) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ success: false, message: "Invalid Request" });
  }

  try {
    const user = await User.findOne({ where: { user_id:userId } });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    if (user.forgotPasswordUsed) {
      return res.status(400).json({ success: false, message: "Code already used" });
    }

    if (!user.forgotPasswordExpires || user.forgotPasswordExpires < new Date()) {
      return res.status(400).json({ success: false, message: "Code expired" });
    }

    if (user.forgotPasswordAttempts >= MAX_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Request a new code.",
      });
    }

    const isMatch = await bcrypt.compare(code, user.forgotPasswordCode);

    if (!isMatch) {
      user.forgotPasswordAttempts += 1;
      await user.save();

      return res.status(400).json({ success: false, message: "Invalid code" });
    }

    // Mark verified but NOT used yet (important)
    user.forgotPasswordAttempts = 0;
    await user.save();

    return res.json({
      success: true,
      message: "Code verified. You can now reset your password.",
    });

  } catch (err) {
    //console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong,please try again" });
  }
};


//Reset password controller
exports.resetPassword = async (req, res) => {
  const { userId,  password } = req.body;
  //console.log('request body is',req.body);

  if (!userId  || !password) {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
    });
  }

  try {
    const user = await User.findOne({ where: { user_id:userId } });

    if (!user) {
      return res.status(400).json({ success: false, message: "User Not Found" });
    }

   

  

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.forgotPasswordUsed = true;

    await user.save();

    return res.json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};