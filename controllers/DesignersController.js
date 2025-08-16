// controllers/designerController.js
const users = require('../models/User');
const { Op } = require('sequelize');


exports.getAllDesigners = async (req, res) => {
  try {
    //const designers = await users.findAll();
      const currentUserId = req.user.id;  // get current user id from token payload

    const designers = await users.findAll({
      where: {
        user_id: { [Op.ne]: currentUserId }  // exclude current user
      }
    });
    res.json(designers);
  } catch (error) {
    console.error('Error fetching designers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
