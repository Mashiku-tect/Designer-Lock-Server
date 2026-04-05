'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payouts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      orderReference: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // unique payout reference
      },

      paymentReference: {
        type: Sequelize.STRING,
        allowNull: false, // links back to original Payment.orderReference
      },

      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'TZS',
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      transactionId: {
        type: Sequelize.STRING,
        allowNull: true, // payout transaction id from ClickPesa
      },

      failureReason: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      designerid: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      product_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'products',
          key: 'product_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('payouts');
  },
};
