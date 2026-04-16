'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'signupCodeAttempts', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('users', 'forgotPasswordAttempts', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('users', 'resetPasswordAttempts', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('users', 'deleteAccountAttempts', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'signupCodeAttempts');
    await queryInterface.removeColumn('users', 'forgotPasswordAttempts');
    await queryInterface.removeColumn('users', 'resetPasswordAttempts');
    await queryInterface.removeColumn('users', 'deleteAccountAttempts');
  },
};