const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ProductCollection = sequelize.define(
  'ProductCollection',
  {
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    collectionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'collections',
        key: 'id',
      },
    },
  },
  {
    tableName: 'product_collections',
    timestamps: false,
  }
);

module.exports = ProductCollection;
