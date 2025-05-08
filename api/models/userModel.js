// models/Category.js
const { DataTypes } = require('sequelize');
const sequelize = require('../models/connection'); // Assuming connection is your sequelize instance

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    }
    // created_at: {
    //     type: DataTypes.DATE,
    //     allowNull: false,
    //     defaultValue: DataTypes.NOW,
    //   }
    
}, {
    tableName: 'users', // Specify the table name
    timestamps: true, // Disable automatic timestamps if your table does not have createdAt/updatedAt
});

module.exports = User;
