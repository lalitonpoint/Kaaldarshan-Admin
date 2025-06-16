// models/Category.js
const { DataTypes } = require('sequelize');
const sequelize = require('../connection'); // Assuming connection is your sequelize instance

const Help = sequelize.define('Help', {
    Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
     mobile: {
        type: DataTypes.STRING,
        allowNull: false,
    },
  
   
    Creation_Date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    //  PositionOrder: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    //     defaultValue: 0
    // },
    // TrnBy: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    // },
    Status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // defaultValue: 1, // Default to enabled
    },
}, {
    tableName: 'help_support', // Specify the table name
    timestamps: false, // Disable automatic timestamps if your table does not have createdAt/updatedAt
});

module.exports = Help;
