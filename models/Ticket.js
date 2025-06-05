// models/Category.js
const { DataTypes } = require('sequelize');
const sequelize = require('../connection'); // Assuming connection is your sequelize instance
const User = require('./User'); // Make sure this is added


const Ticket = sequelize.define('Ticket', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_query: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    admin_reply: {
      type: DataTypes.TEXT,
      allowNull: true
    },
     sender: {
      type: DataTypes.TEXT,
      allowNull: false
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
Ticket.belongsTo(User, { foreignKey: 'user_id' });
module.exports = Ticket;
