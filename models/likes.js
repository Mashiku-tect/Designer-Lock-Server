const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Likes = sequelize.define('Likes', {
    id: { type: DataTypes.UUID, defaultValue:DataTypes.UUIDV4, primaryKey: true },
    product_id: { 
      type: DataTypes.STRING,
      allowNull:false,
    references:{
      model:'products',
      key:'product_id'
    },
  onDelete:'CASCADE',
onUpdate:'CASCADE' },
    user_id: { type: DataTypes.UUID, 
      allowNull: false ,
    references:{
      model:'users',
      key:'user_id'
    },
  onUpdate:'CASCADE',
onDelete:'CASCADE'},
    hasliked: { type: DataTypes.BOOLEAN, defaultValue: true }
    

}, {
  tableName: 'likes',
  timestamps: true,
});

module.exports = Likes;