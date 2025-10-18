const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Likes = sequelize.define('Likes', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    product_id: { type: DataTypes.STRING,allowNull:false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    hasliked: { type: DataTypes.BOOLEAN, defaultValue: true }
    

}, {
  tableName: 'likes',
  timestamps: true,
});

module.exports = Likes;