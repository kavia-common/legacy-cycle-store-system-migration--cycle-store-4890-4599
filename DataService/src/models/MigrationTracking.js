module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const MigrationTracking = sequelize.define('MigrationTracking', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    legacy_id: { type: DataTypes.STRING(100), allowNull: false },
    new_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    entity: { type: DataTypes.STRING(100), allowNull: false },
    migrated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
    status: { type: DataTypes.ENUM('pending', 'completed', 'failed'), allowNull: false }
  }, {
    tableName: 'MigrationTracking',
    timestamps: false
  });

  return MigrationTracking;
};
