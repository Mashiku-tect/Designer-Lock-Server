'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      product_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',   // table name
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      productname: {
        type: Sequelize.STRING,
      },

      clientname: {
        type: Sequelize.STRING,
      },

      clientphonenumber: {
        type: Sequelize.STRING,
      },

      designtitle: {
        type: Sequelize.STRING,
      },

      price: {
        type: Sequelize.INTEGER,
      },

      likes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      Caption: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      orderType: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      status: {
        type: Sequelize.STRING,
        defaultValue: 'In Progress',
      },

      softdeleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  },
};
