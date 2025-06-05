// models/Category.js
const { DataTypes } = require('sequelize');
const sequelize = require('../models/connection'); // Assuming connection is your sequelize instance

const Ticket = sequelize.define('Ticket', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_query: {
      type: DataTypes.TEXT,
      allowNull: true
    },
     sender: {
      type: DataTypes.TEXT,
      allowNull: false
    },
     admin_reply: {
          type: DataTypes.TEXT,
          allowNull: true
        },
    Query_status: {
      type: DataTypes.INTEGER, // e.g. 0 = open, 1 = in-progress, 2 = resolved
      defaultValue: 0
    },
   status: {
      type: DataTypes.INTEGER, // e.g. 0 = active, 1 = deleted
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    modified_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
}, 

{
    tableName: 'ticket_management', // Specify the table name
    timestamps: false, // Disable automatic timestamps if your table does not have createdAt/updatedAt
});

module.exports = Ticket;
