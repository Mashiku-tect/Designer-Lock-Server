'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('images', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      productId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'products', // table name
          key: 'product_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      path: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      fileType: {
        type: Sequelize.ENUM('image', 'video'),
        defaultValue: 'image',
        allowNull: false,
      },

      status: {
        type: Sequelize.STRING,
        defaultValue: 'In Progress',
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
    // Drop ENUM type first if Postgres
    await queryInterface.dropTable('images');
  },
};
