const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  quantity: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    defaultValue: 0,
    validate: { min: { args: [0], msg: "Quantity cannot be negative" } }
  },
  price: { 
    type: DataTypes.FLOAT, 
    allowNull: false,
    validate: { min: { args: [0], msg: "Price cannot be negative" } }
  },
  image: { type: DataTypes.STRING, allowNull: true }
});

module.exports = Product;