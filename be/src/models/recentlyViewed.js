const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const RecentlyViewed = sequelize.define(
  'RecentlyViewed',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'product_id',
    },
    viewedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'viewed_at',
    },
  },
  {
    tableName: 'recently_viewed',
    timestamps: true,
    underscored: true,
  }
);

module.exports = RecentlyViewed;
