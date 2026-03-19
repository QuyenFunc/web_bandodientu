const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const SearchHistory = sequelize.define(
  'SearchHistory',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'user_id',
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'session_id',
    },
    keyword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resultsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'results_count',
    },
  },
  {
    tableName: 'search_history',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);

module.exports = SearchHistory;
