const bcrypt = require("bcrypt");
const validator = require("validator");
const nodemailer = require("nodemailer");
const { User } = require("../models");

exports.register = async (req, res) => {
  const { firstname, lastname, email, phonenumber, password } = req.body;

  if (!firstname || !lastname || !email || !phonenumber || !password) {
    return res.status(400).json({ success: false, message: "Missing Required Fields" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: "Provide a valid Email" });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const existingPhone = await User.findOne({ where: { phonenumber } });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: "Phone number already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //  Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    //  Hash OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    //  Expiry (10 minutes)
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      firstname,
      lastname,
      email,
      phonenumber,
      password: hashedPassword,
      isVerified: false,

      signupCode: hashedOtp,
      signupCodeExpires: expires,
      signupCodeUsed: false,
    });

     user.signupCodeAttempts=0;
     user.save();

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
      subject: "Your Verification Code",
      text: `Hi ${user.firstname}, your verification code is: ${otp}. It expires in 10 minutes.`,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful! Check your email for the verification code.",
      userid:user.user_id
    });

  } catch (err) {
    //console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};



//verify the sent registration code 
exports.verifySignupCode = async (req, res) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ success: false, message: "Invalid Request" });
  }

  try {
    const user = await User.findOne({ where: { user_id:userId } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.signupCodeUsed) {
      return res.status(400).json({ success: false, message: "Code already used" });
    }

    if (!user.signupCodeExpires || user.signupCodeExpires < new Date()) {
      return res.status(400).json({ success: false, message: "Code expired" });
    }

    const MAX_ATTEMPTS = 5;

if (user.signupCodeAttempts >= MAX_ATTEMPTS) {
  return res.status(429).json({
    success: false,
    message: "Too many attempts. Request a new code.",
  });
}



    const isMatch = await bcrypt.compare(code, user.signupCode);

    if (!isMatch) {
       user.signupCodeAttempts += 1;
       await user.save();
      return res.status(400).json({ success: false, message: "Invalid code" });
    }

    //  Mark verified
    user.isVerified = true;
    user.signupCodeUsed = true;

    await user.save();

    return res.json({ success: true, message: "Account verified successfully",userid:user.user_id  });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong,please try again"});
  }
};

//resend the OTP
exports.resendSignupCode = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "Invalid Request" });
  }

  try {
    const user = await User.findOne({ where: { user_id:userId } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "User already verified" });
    }

    //  Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    //  Update fields
    user.signupCode = hashedOtp;
    user.signupCodeExpires = expires;
    user.signupCodeUsed = false;
    user.signupCodeAttempts =  0;

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
      subject: "New Verification Code",
      text: `Hi ${user.firstname}, your new verification code is: ${otp}. It expires in 10 minutes.`,
    });

    return res.json({
      success: true,
      message: "Verification code resent successfully",
      userid:user.user_id
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};