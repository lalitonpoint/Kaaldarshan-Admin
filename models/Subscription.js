// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../connection'); // Adjust the path to your sequelize connection

const plan_management = sequelize.define('plan_management', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    
    plan_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    plan_amount: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    plan_validity: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    plan_feature: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Status :{
        type: DataTypes.INTEGER,
    }
}, {
    tableName: 'plan_management', // Specify the table name
    timestamps: false, // Disable automatic timestamps if your table does not have createdAt/updatedAt
});

module.exports = plan_management;
