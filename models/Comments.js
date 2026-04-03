const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Comments = sequelize.define('Comments', {
    id: { type: DataTypes.UUID, defaultValue:DataTypes.UUIDV4, primaryKey: true },
    
  product_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'products',   // 👈 actual table name
      key: 'product_id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },

  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',      // 👈 actual table name
      key: 'user_id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
    comment: { type: DataTypes.TEXT, allowNull: false },

}, {
  tableName: 'comments',
  timestamps: true,
});

module.exports = Comments;