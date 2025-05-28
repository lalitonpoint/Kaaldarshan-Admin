// models/Category.js
const { DataTypes } = require('sequelize');
const sequelize = require('../connection'); // Assuming connection is your sequelize instance

const Blogs = sequelize.define('Blogs', {
    Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    Title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
     Tags: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    CategoryThumb: {
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
    tableName: 'blogs', // Specify the table name
    timestamps: false, // Disable automatic timestamps if your table does not have createdAt/updatedAt
});

module.exports = Blogs;
