'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.createTable('users', {
  user_id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },

  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  firstname: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  lastname: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  location: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'Not Specified',
  },

  profileimage: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'uploads/profileimages/default.png',
  },

  phonenumber: {
    type: Sequelize.STRING,
  },

  website: {
    type: Sequelize.STRING,
    defaultValue: 'user.com',
  },

  instagram: {
    type: Sequelize.STRING,
    defaultValue: '@user',
  },

  x: {
    type: Sequelize.STRING,
    defaultValue: '@user',
  },

  bio: {
    type: Sequelize.STRING,
    defaultValue: 'Digital designer',
  },

  posts: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },

  haseverloggedin: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },

  isVerified: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },

  verificationToken: {
    type: Sequelize.STRING,
  },

  resetPasswordToken: {
    type: Sequelize.STRING,
  },

  resetPasswordExpires: {
    type: Sequelize.DATE,
  },

  expoPushToken: {
    type: Sequelize.STRING,
    allowNull: true,
  },

  work: {
    type: Sequelize.STRING,
    defaultValue: 'Not Specified',
  },

  education: {
    type: Sequelize.STRING,
    defaultValue: 'Not Specified',
  },

  professionalsummary: {
    type: Sequelize.TEXT,
    defaultValue: 'Not Specified',
  },

  firstlogindate: {
    type: Sequelize.DATE,
  },

  createdAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },

  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },
});

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.dropTable('users');
  }
};
