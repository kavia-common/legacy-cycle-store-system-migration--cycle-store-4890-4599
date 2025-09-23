'use strict';

module.exports = (sequelize, DataTypes) => {
  const MigrationTracking = sequelize.define('MigrationTracking', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    legacy_id: { type: DataTypes.STRING(100), allowNull: false },
    new_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    entity: { type: DataTypes.STRING(100), allowNull: false },
    migrated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.ENUM('pending', 'completed', 'failed'), allowNull: false },
  }, {
    tableName: 'MigrationTracking',
    timestamps: false,
  });
  return MigrationTracking;
};
