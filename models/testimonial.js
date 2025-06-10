// models/Category.js
const { DataTypes } = require('sequelize');
const sequelize = require('../connection'); // Assuming connection is your sequelize instance

const Testimonial = sequelize.define('Testimonial', {
    Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    testimonialName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
     Description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    TestimonialProfile: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    TrnOn: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
     PositionOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    TrnBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // defaultValue: 1, // Default to enabled
    },
}, {
    tableName: 'Testimonial', // Specify the table name
    timestamps: false, // Disable automatic timestamps if your table does not have createdAt/updatedAt
});

module.exports = Testimonial;
