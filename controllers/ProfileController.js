// controllers/profileController.js
const db = require("../config/db");
const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [ 'firstname', 'lastname', 'email', 'phonenumber', 'bio', 'x', 'instagram',  'website', 'profileimage','posts','location']
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
   
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
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const payload = { ...req.body };

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
