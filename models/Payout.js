const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');



// models/Payout.js

  const Payout = sequelize.define("Payout", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderReference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // unique payout reference (PO_xxx)
    },
    paymentReference: {
      type: DataTypes.STRING,
      allowNull: false // links back to the original Payment.orderReference
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "TZS"
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
     allowNull: true
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true // payout transaction id from ClickPesa
    },
    failureReason: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
 {
  tableName: 'payouts',
  timestamps: true
});

  
  

  
module.exports = Payout;
