const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
    NotificationId: {
        type: DataTypes.UUID,
       defaultValue:DataTypes.UUIDV4,
        primaryKey: true
    },

    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
      model: 'users', // 👈 table name, NOT model name
      key: 'user_id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    type: {
        type: DataTypes.ENUM(
            'PAYMENT_MADE',
            'PAYMENT_RECEIVED',
            'PAYMENT_FAILED',
            'NEW_FOLLOWER',
            'NEW_ORDER',
            'GENERIC'
        ),
        defaultValue: 'GENERIC',
        allowNull: false
    },

    data: {
        type: DataTypes.JSON,     // For storing rentalId, roomId, etc.
        allowNull: true
    },

    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }

}, {
    tableName: 'notifications',
    timestamps: true // createdAt, updatedAt
});

module.exports = Notification;
