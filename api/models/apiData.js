// models/Order.js
const { DataTypes } = require('sequelize');
const sequelize = require('../models/connection'); // Assuming connection is your sequelize instance
// const User = require('./userModel'); // Make sure this is added
const apiCount = sequelize.define('apiCount', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  remaining_api_calls: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

 
 





}, {
  tableName: 'api_count',
  timestamps: true // createdAt and updatedAt will be handled automatically
});


module.exports = apiCount;
