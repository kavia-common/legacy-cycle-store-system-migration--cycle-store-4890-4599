'use strict';

module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    entity: { type: DataTypes.STRING(100), allowNull: false },
    entity_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    action: { type: DataTypes.STRING(50), allowNull: false },
    performed_by: { type: DataTypes.STRING(100), allowNull: false },
    performed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    details: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'AuditLog',
    timestamps: false,
  });
  return AuditLog;
};
