module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Customer = sequelize.define('Customer', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    first_name: { type: DataTypes.STRING(100), allowNull: false },
    last_name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
  }, {
    tableName: 'Customer',
    timestamps: false
  });

  return Customer;
};
