const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // adjust path to your Sequelize instance

const Image = sequelize.define('Image', {
  id: {
    type: DataTypes.UUID,
    defaultValue:DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Foreign key linking to parent table 
  productId: {
    type: DataTypes.STRING,
    allowNull: false,
    references:{
      model:'products',
      key:'product_id'

    },
    onUpdate:'CASCADE',
      onDelete:'CASCADE'
   
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
