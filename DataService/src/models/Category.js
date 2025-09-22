module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'Category',
    timestamps: false
  });

  return Category;
};
