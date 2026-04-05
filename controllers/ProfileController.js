// controllers/profileController.js
const db = require("../config/db");
const {User,Skills,Follow} = require('../models');
const validator = require('validator');

exports.getProfile = async (req, res) => {
  try {
    const designerId=req.user.id;
    const user = await User.findByPk(req.user.id, {
      attributes: [ 'firstname', 'lastname', 'email', 'phonenumber', 'bio', 'x', 'instagram',  'website', 'profileimage','posts','location','work','education','professionalsummary','user_id'],
          include: [{
        model: Skills,
        attributes: ['id','skill'] // Assuming the skill has a 'name' field
      }]
    });
    if (!user) return res.status(404).json({ error: 'User not found' });


     // Count followers (users who follow this designer)
    const followersCount = await Follow.count({
      where: {
        following_id: designerId
      }
    });

    //  Count following (users this designer is following)
    const followingCount = await Follow.count({
      where: {
        follower_id: designerId
      }
    });

  
    res.json({ 
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phonenumber: user.phonenumber,
      bio: user.bio,
      x: user.x,
      instagram: user.instagram,
      website: user.website,
      profileimage: user.profileimage,
      posts: user.posts,
      location: user.location,
      work: user.work,
      education: user.education,
      skills: user.Skills, // Send the full skill objects
      professionalsummary: user.professionalsummary,
      followers:followersCount,
      following:followingCount,
      id:user.user_id,
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const payload = { ...req.body };
    //console.log("Payload",payload)
    const userId = req.user.id;

    // --- 1. Check if payload contains email ---
    if (payload.email) {
      // Validate email format
      const isEmailValid = validator.isEmail(payload.email);
      if (!isEmailValid) {
        return res.status(400).json({ error: 'Invalid email format.' });
      }

      // Check if email already exists for another user
      const emailExists = await User.findOne({
        where: { email: payload.email },
      });
      if (emailExists && emailExists.user_id !== userId) {
        return res.status(400).json({ message: 'Email already in use.' });
      }
    }

    // --- 2. Check if payload contains phone number ---
    if (payload.phonenumber) {
      // Validate phone format: +255 followed by 9 digits
      const phoneRegex = /^\+255\d{9}$/;
      if (!phoneRegex.test(payload.phonenumber)) {
        return res.status(400).json({
          message: 'Invalid phone number format. Expected +255XXXXXXXXX.',
        });
      }

      // Check if phone number already exists for another user
      const phoneExists = await User.findOne({
        where: { phonenumber: payload.phonenumber },
      });
      if (phoneExists && phoneExists.user_id !== userId) {
        return res.status(400).json({ message: 'Phone number already in use.' });
      }
    }

    // --- 3. Update user if validations pass ---
    await User.update(payload, { where: { user_id: userId } });

    // --- 4. Fetch updated record ---
    const updated = await User.findByPk(userId, {
      attributes: [
        'firstname',
        'lastname',
        'email',
        'phonenumber',
        'bio',
        'x',
        'instagram',
        'location',
        'website',
        'profileimage',
      ],
    });

    res.json({ user: updated });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

//handle profile image upload
// controllers/profileController.js

exports.uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming your auth middleware sets req.user
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate the relative path to store in DB
    const imagePath = `uploads/profileimages/${file.filename}`;

    // Update the user in the database
    const [updated] = await User.update(
      { profileimage: imagePath },
      { where: { user_id: userId } }
    );

    if (updated === 0) {
      return res.status(404).json({ error: 'User not found or not updated' });
    }

    const updatedUser = await User.findByPk(userId);

    res.json({ profileimage: updatedUser.profileimage });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//add a user skill

exports.addUserSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skills } = req.body;
    //console.log('Adding skill:', skills, 'for user ID:', userId);
    if (!skills) {
      return res.status(400).json({ message: 'Skill is required' });
    }
    //create a skill for the user
    await Skills.create({
      user_id: userId,
      skill: skills
    });
    //find all skills for the user
    const userSkills = await Skills.findAll({ where: { user_id: userId } });
    res.status(200).json({success:true, message: 'Skill added',skills: userSkills,newskill:skills });
  } catch (error) {
    //console.error('Add skill error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


//remove a user skill
exports.removeUserSkill = async (req, res) => {
  try{
    const skillid = req.params.id;
    //console.log('Removing skill ID:', skillid); 
    const skill=await Skills.findOne({
      where:{id:skillid},
       attributes: ['skill']
    })
    //console.log("skill name",skill)
    const skillName = skill ? skill.skill : null;
    await Skills.destroy({ where: { id: skillid } });
    res.status(200).json({ success: true, message: 'Skill removed',removedskill:skillName});
  }
  catch (error) {
    //console.error('Remove skill error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
  