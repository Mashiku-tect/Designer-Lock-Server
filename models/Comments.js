const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Comments = sequelize.define('Comments', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    product_id: { type: DataTypes.STRING,allowNull:false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: false },

}, {
  tableName: 'comments',
  timestamps: true,
});

module.exports = Comments;