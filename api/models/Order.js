// models/Order.js
const { DataTypes } = require('sequelize');
const sequelize = require('../models/connection'); // Assuming connection is your sequelize instance

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  order_id: {
    type: DataTypes.STRING, // You can also use UUID, but STRING is fine for uuidv4()
    allowNull: false,
    unique: true
  },
  pre_transaction_id: {
    type: DataTypes.STRING, // You can also use UUID, but STRING is fine for uuidv4()
    allowNull: false
   
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  plan_validity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  plan_name: {
    type: DataTypes.TEXT, // store JSON string of item array
    allowNull: false
  },

  total_amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM('pending', 'completed', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  }

}, {
  tableName: 'orders',
  timestamps: true // createdAt and updatedAt will be handled automatically
});

module.exports = Order;
