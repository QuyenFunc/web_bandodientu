const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const LoyaltyHistory = sequelize.define(
  'LoyaltyHistory',
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
    orderId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'order_id',
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('earn', 'spend', 'refund', 'adjustment'),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'loyalty_histories',
    timestamps: true,
    underscored: true,
  }
);

module.exports = LoyaltyHistory;
