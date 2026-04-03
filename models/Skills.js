const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Skills = sequelize.define('Skills', {
    id: { type: DataTypes.UUID, defaultValue:DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false,
      references:{
        model:'users',
        key:'user_id'
      },
      onDelete:'CASCADE',
      onUpdate:'CASCADE'
     },
    skill: { type: DataTypes.STRING, allowNull: false },

}, {
  tableName: 'skills',
  timestamps: false,
});

module.exports = Skills;