const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  user_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  email: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },

  firstname: { type: DataTypes.STRING, allowNull: false },
  lastname: { type: DataTypes.STRING, allowNull: false },

  location: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Not Specified' },
  profileimage: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'uploads/profileimages/default.png'
  },

  phonenumber: DataTypes.STRING,

  website: { type: DataTypes.STRING, defaultValue: 'user.com' },
  instagram: { type: DataTypes.STRING, defaultValue: '@user' },
  x: { type: DataTypes.STRING, defaultValue: '@user' },

  bio: { type: DataTypes.STRING, defaultValue: 'Digital designer' },

  posts: { type: DataTypes.INTEGER, defaultValue: 0 },
  haseverloggedin: { type: DataTypes.INTEGER, defaultValue: 0 },

  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },

  expoPushToken: { type: DataTypes.STRING, allowNull: true },

  work: { type: DataTypes.STRING, defaultValue: 'Not Specified' },
  education: { type: DataTypes.STRING, defaultValue: 'Not Specified' },
  professionalsummary: { type: DataTypes.TEXT, defaultValue: 'Not Specified' },

  firstlogindate: DataTypes.DATE,

  // =========================
  //  SIGNUP VERIFICATION
  // =========================
  signupCode: { type: DataTypes.STRING },
  signupCodeExpires: { type: DataTypes.DATE },
  signupCodeUsed: { type: DataTypes.BOOLEAN, defaultValue: false },

  // =========================
  //  FORGOT PASSWORD
  // =========================
  forgotPasswordCode: { type: DataTypes.STRING },
  forgotPasswordExpires: { type: DataTypes.DATE },
  forgotPasswordUsed: { type: DataTypes.BOOLEAN, defaultValue: false },

  // =========================
  //  RESET PASSWORD (LOGGED IN)
  // =========================
  resetPasswordCode: { type: DataTypes.STRING },
  resetPasswordExpires: { type: DataTypes.DATE },
  resetPasswordUsed: { type: DataTypes.BOOLEAN, defaultValue: false },

  // =========================
  // DELETE ACCOUNT
  // =========================
  deleteAccountCode: { type: DataTypes.STRING },
  deleteAccountExpires: { type: DataTypes.DATE },
  deleteAccountUsed: { type: DataTypes.BOOLEAN, defaultValue: false },

  //CONTROLL THE NUMBER OF ATTEMPTS
   signupCodeAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
   forgotPasswordAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    resetPasswordAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
      deleteAccountAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },

}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;