const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supplier = sequelize.define('Supplier', {
  name: { type: DataTypes.STRING, allowNull: false },
  contactEmail: { type: DataTypes.STRING, validate: { isEmail: true } },
  phone: { type: DataTypes.STRING }
});

module.exports = Supplier;