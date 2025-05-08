const { DataTypes } = require('sequelize');
const sequelize = require('../connection'); // Adjust path based on your setup

const Banner = sequelize.define('Banner', {
  Banner_MstId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  BannerTitle: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  BannerLocation: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '0-Top banner, 1-footer',
  },
  BannerImagePath: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  Status: {
    type: DataTypes.SMALLINT,
    allowNull: false,
  },
  TrnOn: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
},
  TrnBy: {
    type: DataTypes.INTEGER,
    allowNull: true, // Adjust if necessary
  }
}, {
  timestamps: false, // If you're not using the default `createdAt` and `updatedAt`
  tableName: 'mst_banner' // Adjust to your actual table name if needed
});

module.exports = Banner;
