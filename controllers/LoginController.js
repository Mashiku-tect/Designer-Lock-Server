// controllers/authController.js

const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {User} = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYiLCJpYXQiOjE2MzAwMDAwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'; // Store in .env in production

exports.login = async (req, res) => {
  const { email, password,pushToken } = req.body;
  if(!email||!password){
    return res.status(400).json({success:false,message:"Missing Required Fields"});
  }

  try {
    // Find user by email or phone
    const user = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ email }, { phonenumber: email }],
      },
    });

    if (!user) {
      return res.status(400).json({success:false, message: 'User Not Found' });
    }
    if (!user.isVerified) {
  return res.status(403).json({success:false, message: "Please verify your email before logging in" });
 }


    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect Username Or Password' });
    }

    //check if push token is not the same as stored one
    if(pushToken&&pushToken!==user.expoPushToken){
      //update push token
      await User.update(
        {
          expoPushToken: pushToken,
        },
        {
          where: { user_id: user.user_id }
        }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    //update first login date
    await User.update(
  {
   
    firstlogindate: new Date(), // store current datetime
  },
  {
    where: { email: email }
  }
);


    return res.status(200).json({
      success:true,
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phonenumber: user.phonenumber,
      },
    });
  } catch (err) {
    //console.error('Login error:', err);
    return res.status(500).json({ success:false,message: 'Something went wrong,Please try again later' });
  }
};
