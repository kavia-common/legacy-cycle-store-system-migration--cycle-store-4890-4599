module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const SupportTicket = sequelize.define('SupportTicket', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    customer_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    subject: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM('open', 'closed', 'pending'), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
  }, {
    tableName: 'SupportTicket',
    timestamps: false
  });

  return SupportTicket;
};
