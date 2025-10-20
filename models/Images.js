const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // adjust path to your Sequelize instance

const Image = sequelize.define('Image', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Foreign key linking to parent table (e.g., post, product)
  productId: {
    type: DataTypes.STRING,
    allowNull: false,
   
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
   fileType: {
    type: DataTypes.ENUM('image', 'video'),
    defaultValue: 'image',
  },
  status: { type: DataTypes.STRING, defaultValue: 'In Progress' },
  
}, {
  tableName: 'images',
  timestamps: true, // createdAt & updatedAt
});

module.exports = Image;
