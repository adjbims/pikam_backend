"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_modules extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

    }
  }
  tbl_modules.init(
    {
      module_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      module_uuid: DataTypes.STRING,
      module_name: DataTypes.STRING,
      module_desc: DataTypes.STRING,
      module_create_at: DataTypes.DATE,
      module_update_at: DataTypes.DATE,
      module_delete_at: DataTypes.DATE,
      module_create_by: DataTypes.STRING,
      module_update_by: DataTypes.STRING,
      module_delete_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_modules",
      tableName: "tbl_modules",
      timestamps: false,
    }
  );
  return tbl_modules;
};