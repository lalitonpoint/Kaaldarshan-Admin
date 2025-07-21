// models/ApiHit.js
const { DataTypes } = require('sequelize');
const sequelize = require('../models/connection'); // Assuming connection is your sequelize instance

  const ApiHit = sequelize.define('ApiHit', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    max_hits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    hits_used: {
      type: DataTypes.INTEGER,
      
      defaultValue: 0
    },
    last_hit_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'api_hits',
    timestamps: false
  });

  module.exports = ApiHit;

