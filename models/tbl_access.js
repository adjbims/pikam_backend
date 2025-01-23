
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_access extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // tbl_access model
    // tbl_access model
    static associate(models) {
      tbl_access.belongsTo(models.tbl_modules, {
        foreignKey: "access_module",
        targetKey: "module_uuid", // sesuaikan dengan nama kolom yang sesuai di tbl_modules
        as: "access_module_as",
      });

      tbl_access.belongsTo(models.tbl_permissions, {
        foreignKey: "access_permission",
        targetKey: "permission_uuid", // sesuaikan dengan nama kolom yang sesuai di tbl_permissions
        as: "access_permission_as",
      });

      tbl_access.belongsTo(models.tbl_levels, {
        foreignKey: "access_level",
        targetKey: "level_uuid", // sesuaikan dengan nama kolom yang sesuai di tbl_levels
        as: "access_level_as",
      });
    }
  }
  tbl_access.init(
    {
      access_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      access_uuid: DataTypes.STRING,
      access_module: DataTypes.STRING,
      access_permission: DataTypes.STRING,
      access_level: DataTypes.STRING,
      access_create_at: DataTypes.DATE,
      access_update_at: DataTypes.DATE,
      access_delete_at: DataTypes.DATE,
      access_create_by: DataTypes.STRING,
      access_update_by: DataTypes.STRING,
      access_delete_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_access",
      tableName: "tbl_access",
      timestamps: false,
      paranoid: true,
    }
  );
  return tbl_access;
};
