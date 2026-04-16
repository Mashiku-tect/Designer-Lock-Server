'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'signupCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'signupCodeExpires', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'signupCodeUsed', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    // =========================
    // FORGOT PASSWORD
    // =========================
    await queryInterface.addColumn('users', 'forgotPasswordCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'forgotPasswordExpires', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'forgotPasswordUsed', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    // =========================
    // RESET PASSWORD (LOGGED IN)
    // =========================
    await queryInterface.addColumn('users', 'resetPasswordCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });

   
    await queryInterface.addColumn('users', 'resetPasswordUsed', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    // =========================
    // DELETE ACCOUNT
    // =========================
    await queryInterface.addColumn('users', 'deleteAccountCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'deleteAccountExpires', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'deleteAccountUsed', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    // =========================
    // REMOVE OLD COLUMNS (optional)
    // =========================
    await queryInterface.removeColumn('users', 'verificationToken');
    await queryInterface.removeColumn('users', 'resetPasswordToken');
    await queryInterface.removeColumn('users', 'resetPasswordExpires');
  },

  async down(queryInterface, Sequelize) {
    // REMOVE NEW COLUMNS
    await queryInterface.removeColumn('users', 'signupCode');
    await queryInterface.removeColumn('users', 'signupCodeExpires');
    await queryInterface.removeColumn('users', 'signupCodeUsed');

    await queryInterface.removeColumn('users', 'forgotPasswordCode');
    await queryInterface.removeColumn('users', 'forgotPasswordExpires');
    await queryInterface.removeColumn('users', 'forgotPasswordUsed');

    await queryInterface.removeColumn('users', 'resetPasswordCode');
    await queryInterface.removeColumn('users', 'resetPasswordExpires');
    await queryInterface.removeColumn('users', 'resetPasswordUsed');

    await queryInterface.removeColumn('users', 'deleteAccountCode');
    await queryInterface.removeColumn('users', 'deleteAccountExpires');
    await queryInterface.removeColumn('users', 'deleteAccountUsed');

    // RESTORE OLD COLUMNS
    await queryInterface.addColumn('users', 'verificationToken', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'resetPasswordToken', {
      type: Sequelize.STRING,
      allowNull: true,
    });

  
  },
};