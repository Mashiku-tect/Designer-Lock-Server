const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Follow = sequelize.define('Follow', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    follower_id: { type: DataTypes.INTEGER,allowNull:false },
    following_id: { type: DataTypes.INTEGER, allowNull: false },

}, {
  tableName: 'follows',
  timestamps: true,
});

module.exports = Follow;