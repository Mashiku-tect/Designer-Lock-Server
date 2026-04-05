// models/Payment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Payment = sequelize.define('Payment', {
  payment_id: { type: DataTypes.UUID, defaultValue:DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, 
    allowNull: false,
  references:{
    model:'users',
    key:'user_id'
  } ,
onUpdate:'CASCADE',
onDelete:'CASCADE'},
  product_id: { type: DataTypes.STRING, 
    allowNull: false ,
    references:{
      model:'products',
      key:'product_id'
    },
    onDelete:'CASCADE',
    onUpdate:'CASCADE'
  },

  orderReference: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  clientId: { type: DataTypes.STRING, allowNull: true },
  

  channel: { type: DataTypes.STRING, allowNull: true },
 

  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'payments',
  timestamps: true
});



module.exports = Payment;
