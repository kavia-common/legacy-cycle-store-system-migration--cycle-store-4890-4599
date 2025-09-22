module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Sale = sequelize.define('Sale', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    customer_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    sale_date: { type: DataTypes.DATE, allowNull: false },
    total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } }
  }, {
    tableName: 'Sale',
    timestamps: false
  });

  return Sale;
};
