// models/Product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Product = sequelize.define('Product', {
  product_id: { type: DataTypes.STRING, primaryKey: true },
  user_id: {
  type: DataTypes.UUID,
  references: {
    model: 'users',  // <-- table name as string
    key: 'user_id'
  },
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
},

  productname: DataTypes.STRING,
  
  clientname: DataTypes.STRING,
  clientphonenumber: DataTypes.STRING,
  designtitle: DataTypes.STRING,
  price: DataTypes.INTEGER,
  likes:{ type:DataTypes.INTEGER,defaultValue:0},
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: false },
  Caption:{ type: DataTypes.TEXT, allowNull:true},
  orderType:{type:DataTypes.STRING, allowNull:false},
  
  status: { type: DataTypes.STRING, defaultValue: 'In Progress' },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  softdeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
}, {
  tableName: 'products',
  timestamps: true
});



module.exports = Product;
