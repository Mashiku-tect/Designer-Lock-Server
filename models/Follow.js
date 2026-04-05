const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Follow = sequelize.define('Follow', {
    id: { type: DataTypes.UUID, defaultValue:DataTypes.UUIDV4, primaryKey: true },
    follower_id: { 
      type: DataTypes.UUID,
      allowNull:false ,
    references:{
      model:'users', //actual table name
      key:'user_id'
    },
  onUpdate:'CASCADE',
       onDelete:'CASCADE'
      },
    following_id: { 
      type: DataTypes.UUID,
       allowNull: false,
       references:{
        model:'users',
        key:'user_id'
       },
       onUpdate:'CASCADE',
       onDelete:'CASCADE'
       },

}, {
  tableName: 'follows',
  timestamps: true,
});

module.exports = Follow;
