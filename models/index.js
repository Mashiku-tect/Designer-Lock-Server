const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

// Import all models (NO associations inside model files)
const User = require('./User');
const Product = require('./Product');
const Images = require('./Images');
const Payment = require('./Payment');
const Payout = require('./Payout');
const Skills = require('./Skills');
const Comments=require('./Comments');
const Likes=require('./likes');
const Follow=require('./Follow');

// ==================
// 📦 Define Associations
// ==================

// User & Product
User.hasMany(Product, { foreignKey: 'user_id' });
Product.belongsTo(User, { foreignKey: 'user_id' });

// Product & Image
Product.hasMany(Images, { foreignKey: 'productId' });
Images.belongsTo(Product, { foreignKey: 'productId' });

// Product & Payment
Product.hasMany(Payment, { foreignKey: 'product_id' }); // Matches Payment.product_id
Payment.belongsTo(Product, { foreignKey: 'product_id' });

// Payment & Payout
Payment.hasOne(Payout, {
  foreignKey: 'paymentReference',
  sourceKey: 'orderReference'
});
Payout.belongsTo(Payment, {
  foreignKey: 'paymentReference',
  targetKey: 'orderReference'
});

//Skills & User Associations
User.hasMany(Skills, { foreignKey: 'user_id' });
Skills.belongsTo(User, { foreignKey: 'user_id' });


//Comments & User & Product Associations
User.hasMany(Comments, { foreignKey: 'user_id' });
Comments.belongsTo(User, { foreignKey: 'user_id' });
Product.hasMany(Comments, { foreignKey: 'product_id' });
Comments.belongsTo(Product, { foreignKey: 'product_id' });


//Likes & User & Product Associations
User.hasMany(Likes, { foreignKey: 'user_id' });
Likes.belongsTo(User, { foreignKey: 'user_id' });
Product.hasMany(Likes, { foreignKey: 'product_id' });
Likes.belongsTo(Product, { foreignKey: 'product_id' });

//Follow and User associations
User.belongsToMany(User, {
  through: Follow,
  as: 'Following',
  foreignKey: 'follower_id',
  otherKey: 'following_id'
});

User.belongsToMany(User, {
  through: Follow,
  as: 'Followers',
  foreignKey: 'following_id',
  otherKey: 'follower_id'
});


module.exports = {
  sequelize,
  User,
  Product,
  Images,
  Payment,
  Payout,
  Skills,
  Comments,
  Likes,
  Follow,
};
