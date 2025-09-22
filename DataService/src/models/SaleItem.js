module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const SaleItem = sequelize.define('SaleItem', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    sale_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    inventory_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, validate: { min: 1 } },
    unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } }
  }, {
    tableName: 'SaleItem',
    timestamps: false
  });

  return SaleItem;
};
