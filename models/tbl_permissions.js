'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_permissions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_permissions.init(
    {
      permission_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
    permission_uuid: DataTypes.STRING,
    permission_name: DataTypes.STRING,
    permission_desc: DataTypes.STRING,
    permission_create_at: DataTypes.DATE,
    permission_update_at: DataTypes.DATE,
    permission_delete_at: DataTypes.DATE,
    permission_create_by: DataTypes.STRING,
    permission_update_by: DataTypes.STRING,
    permission_delete_by: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'tbl_permissions',
    tableName: 'tbl_permissions',
    timestamps: false
  });
  return tbl_permissions;
};