"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_levels extends Model {
    static associate(models) {
      
   }   
  }
  tbl_levels.init(
    {
      level_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      level_uuid: DataTypes.STRING,
      level_name: DataTypes.STRING,
      level_create_at: DataTypes.DATE,
      level_update_at: DataTypes.DATE,
      level_delete_at: DataTypes.DATE,
      level_create_by: DataTypes.STRING,
      level_update_by: DataTypes.STRING,
      level_delete_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_levels",
      tableName: "tbl_levels",
      timestamps: false,
    }
  );
  return tbl_levels;
};