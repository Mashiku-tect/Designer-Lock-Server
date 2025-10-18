// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const User = sequelize.define('User', {
  user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  firstname: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false,defaultValue: 'Not Specified' },
  lastname: { type: DataTypes.STRING, allowNull: false },
  profileimage:{ type:DataTypes.STRING,allowNull: false,
    defaultValue: 'uploads/profileimages/default.png' },
  phonenumber: DataTypes.STRING,
  website: { type: DataTypes.STRING, defaultValue: 'user.com' },
  instagram: { type: DataTypes.STRING, defaultValue: '@user' },
  x: { type: DataTypes.STRING, defaultValue: '@user' },
  bio: { type: DataTypes.STRING, defaultValue: 'Digital designer' },
  posts: { type: DataTypes.INTEGER, defaultValue: 0 },
  haseverloggedin: { type: DataTypes.INTEGER, defaultValue: 0 },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verificationToken: { type: DataTypes.STRING },
    resetPasswordToken: { type: DataTypes.STRING },
    work: { type: DataTypes.STRING, defaultValue: 'Not Specified' },
    education: { type: DataTypes.STRING, defaultValue: 'Not Specified' },
    professionalsummary: { type: DataTypes.TEXT, defaultValue: 'Not Specified' },
    
resetPasswordExpires: { type: DataTypes.DATE },
firstlogindate: DataTypes.DATE,
}, {
  tableName: 'users',
  timestamps: false,
});

  

module.exports = User;
