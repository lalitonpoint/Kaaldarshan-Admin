// models/Category.js
const { DataTypes } = require('sequelize');
const sequelize = require('../connection'); // Assuming connection is your sequelize instance

const basic_data = sequelize.define('basic_data', {
    Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
     type: {
        type: DataTypes.INTEGER,
        allowNull: false,
       
    },
    Description :{
         type: DataTypes.TEXT,
        allowNull: false,
    },
    Status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // defaultValue: 1, // Default to enabled
    },
       Creation_Date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'basic_data', // Specify the table name
    timestamps: false, // Disable automatic timestamps if your table does not have createdAt/updatedAt
});

module.exports = basic_data;
