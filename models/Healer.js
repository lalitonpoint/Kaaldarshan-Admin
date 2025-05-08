//models /Healer.js
const { DataTypes } = require('sequelize');
const sequelize = require('../connection'); // Assuming connection is your sequelize instance

const Healer = sequelize.define('Healer', {
  Healer_MstId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  HealerName: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  HealerSlug: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  Mobile: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  EmailId: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  Gender: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "1-male, 2-female",
  },
  CountryCode: {
    type: DataTypes.STRING(8),
    allowNull: false,
  },
  ProfilePicture: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  AboutHealer: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  HealerHeadline: {
    type: DataTypes.STRING(250),
    allowNull: false,
  },
  Designation: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  SocialMediaLinks: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ProfileThemecolor: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  Exprience: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  IsLive: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: "1-live, 0-non live",
  },
  IsLiveOn: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  IsPro: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: "0-no, 1-yes",
  },
  OTP: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  OTPCreationTime: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  EmailOTP: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  EmailOTPCreationTime: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  HealerLastLoginOn: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  HealerDeviceToken: {
    type: DataTypes.STRING(250),
    allowNull: false,
  },
  PositionOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  BookingPeriod: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: "1-active, 2-disabled, 3-delete",
  },
  HealerCreatedDateTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  TimeZone: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  TrnBy: {
    type: DataTypes.STRING, // adjust based on datatype in DB
    allowNull: true,
  }
}, {
  tableName: 'mst_healers', // Replace with your actual table name
  timestamps: false,
});

module.exports = Healer;
