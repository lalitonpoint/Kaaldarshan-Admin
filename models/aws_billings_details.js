const { DataTypes } = require('sequelize');
const sequelize = require('../connection'); // your sequelize instance

const AwsBillingLog = sequelize.define('AwsBillingLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  total_cost: {
    type: DataTypes.JSON,
    allowNull: false
  },
  service_breakdown: {
    type: DataTypes.JSON,
    allowNull: false
  },
  daily_breakdown: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'aws_billing',
  timestamps: true, // adds createdAt and updatedAt
});

module.exports = AwsBillingLog;
