// controllers/authController.js

const db = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const validator = require('validator');
const nodemailer = require("nodemailer");
const {User} = require("../models");

exports.register = async (req, res) => {
  const { firstname, lastname, email, phonenumber, password } = req.body;
  if(!firstname||!lastname||!email||!phonenumber||!password){
    return res.status(400).json({success:false,message:"Missing Required Fields"})
  }
  //check the validity of the email
  if(!validator.isEmail(email)){
     return res.status(400).json({success:false,message:"Provide a valid Email"})
  }

  try {
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({success:false, message: "Email already registered" });
    }

    const existingPhone = await User.findOne({ where: { phonenumber } });
    if (existingPhone) {
      return res.status(400).json({ success:false,message: "Phone number already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user (not verified yet)
    const user = await User.create({
      firstname,
      lastname,
      email,
      phonenumber,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
    });

    // Send verification email
    const transporter = nodemailer.createTransport({
        host: "smtppro.zoho.com",
      port: 465,            // 465 for SSL
      secure: true,        // true if using 465
      auth: {
        user: process.env.ZOHO_EMAIL_USER, // app1@mydomain.com
        pass: process.env.ZOHO_EMAIL_PASS, // Zoho App Password
      },
    });

    const verifyLink = `${process.env.SERVER_URL}/api/verify/${verificationToken}`;

    await transporter.sendMail({
      from: `"PixelProof" <${process.env.ZOHO_EMAIL_USER}>`,
      to: user.email,
      subject: "Verify your email",
      text: `Hi ${user.firstname}, please verify your email by clicking the following link: ${verifyLink}`,
    });

    return res.status(201).json({success:true,
      message: "Registration successful! Please check your email to verify your account.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({success:false, message: "Internal server error" });
  }
};
