const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { User } = require("../models");

const MAX_ATTEMPTS = 5;

exports.sendResetPasswordCode = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    //  Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    //  Store
    user.resetPasswordCode = hashedOtp;
    user.resetPasswordExpires = expires;
    user.resetPasswordUsed = false;
    user.resetPasswordAttempts = 0;

    await user.save();

    //  Send email
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
      subject: "Reset Password Code",
      text: `Hi ${user.firstname}, your reset password code is: ${otp}. It expires in 10 minutes.`,
    });

    return res.json({
      success: true,
      userid:user.user_id,
      message: "Reset password code sent to your email",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong,Please try again later" });
  }
};




exports.resendResetPasswordCode = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordCode = hashedOtp;
    user.resetPasswordExpires = expires;
    user.resetPasswordUsed = false;
    user.resetPasswordAttempts = 0;

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
      subject: "New Reset Password Code",
      text: `Hi ${user.firstname}, your new reset password code is: ${otp}. It expires in 10 minutes.`,
    });

    return res.json({
      success: true,
      message: "Reset code resent successfully",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong,please try again" });
  }
};





exports.verifyActionCode = async (req, res) => {
  const { code, action } = req.body;

  if (!code || !action) {
    return res.status(400).json({
      success: false,
      message: "Code and action are required",
    });
  }

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let storedCode, expires, used, attemptsField;

    //  Map action → fields
    if (action === "change_password") {
      storedCode = user.resetPasswordCode;
      expires = user.resetPasswordExpires;
      used = user.resetPasswordUsed;
      attemptsField = "resetPasswordAttempts";
    } else if (action === "delete_account") {
      storedCode = user.deleteAccountCode;
      expires = user.deleteAccountExpires;
      used = user.deleteAccountUsed;
      attemptsField = "deleteAccountAttempts";
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }

    //  Checks
    if (used) {
      return res.status(400).json({ success: false, message: "Code already used" });
    }

    if (!expires || expires < new Date()) {
      return res.status(400).json({ success: false, message: "Code expired" });
    }

    if (user[attemptsField] >= MAX_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Request a new code.",
      });
    }

    const isMatch = await bcrypt.compare(code, storedCode);

    if (!isMatch) {
      user[attemptsField] += 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid code",
      });
    }

    //  Success
    user[attemptsField] = 0;

    // Optional flags (recommended)
    if (action === "change_password") {
      user.resetPasswordUsed = true;
    }

    if (action === "delete_account") {
      user.deleteAccountUsed = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        action === "delete_account"
          ? "Code verified. You can now delete your account."
          : "Code verified. You can now change your password.",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};