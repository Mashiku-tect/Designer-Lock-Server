const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { User } = require("../models");

exports.sendDeleteAccountCode = async (req, res) => {
  try {

    //console.log('Request Received in delete account controller')
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.deleteAccountCode = hashedOtp;
    user.deleteAccountExpires = expires;
    user.deleteAccountUsed = false;
    user.deleteAccountAttempts = 0;

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
      subject: "Delete Account Code",
      text: `Hi ${user.firstname}, your account deletion code is: ${otp}. It expires in 10 minutes.`,
    });

    return res.json({
      success: true,
      message: "Delete account code sent",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


exports.resendDeleteAccountCode = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.deleteAccountCode = hashedOtp;
    user.deleteAccountExpires = expires;
    user.deleteAccountUsed = false;
    user.deleteAccountAttempts = 0;

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
      subject: "New Delete Account Code",
      text: `Hi ${user.firstname}, your new deletion code is: ${otp}. It expires in 10 minutes.`,
    });

    return res.json({
      success: true,
      message: "Delete account code resent",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};



exports.DeleteAccount = async (req,res) =>{
    try{
        const user=await User.findByPk(req.user.id);
        if(!user){
            return res.status(404).json({success:false,message:'User Not Found'})
        }
        await user.destroy();
        return res.status(200).json({
            success:true,
            message:'Account Deleted Successfully'
        })


    }
    catch (error){
        console.log('Error Deleting Account',error)
        return res.status(500).json({
            success:false,
            message:'Something Went wrong,Please Try again'
        })

    }
}