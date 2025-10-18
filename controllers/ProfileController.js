// controllers/profileController.js
const db = require("../config/db");
const {User,Skills} = require('../models');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [ 'firstname', 'lastname', 'email', 'phonenumber', 'bio', 'x', 'instagram',  'website', 'profileimage','posts','location','work','education','professionalsummary'],
          include: [{
        model: Skills,
        attributes: ['id','skill'] // Assuming the skill has a 'name' field
      }]
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

   //console.log('Fetched user:', user.toJSON());
       // Extract skill names into a plain array
    //const skillsArray = user.Skills.map(skill => skill.skill);
   // console.log('User skills:', skillsArray);
   
    //console user location
    //console.log('User location:', user.location);
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
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const payload = { ...req.body };
    //console.log('Update payload:', payload);

    await User.update(payload, { where: { user_id: req.user.id } });
    const updated = await User.findByPk(req.user.id, {
      attributes: ['firstname', 'lastname', 'email', 'phonenumber', 'bio', 'x',  'instagram', 'location', 'website', 'profileimage']
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
      return res.status(400).json({ error: 'Skill is required' });
    }
    //create a skill for the user
    await Skills.create({
      user_id: userId,
      skill: skills
    });
    //find all skills for the user
    const userSkills = await Skills.findAll({ where: { user_id: userId } });
    res.json({success:true, message: 'Skill added',skills: userSkills });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


//remove a user skill
exports.removeUserSkill = async (req, res) => {
  try{
    const skillid = req.params.id;
    //console.log('Removing skill ID:', skillid); 
    await Skills.destroy({ where: { id: skillid } });
    res.json({ success: true, message: 'Skill removed' });
  }
  catch (error) {
    console.error('Remove skill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
  