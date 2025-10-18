const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Skills = sequelize.define('Skills', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    skill: { type: DataTypes.STRING, allowNull: false },

}, {
  tableName: 'skills',
  timestamps: false,
});

module.exports = Skills;