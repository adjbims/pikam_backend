"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_media extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
    }
  }
  tbl_media.init(
    {
      media_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      media_uuid: DataTypes.STRING,
      media_uuid_table: DataTypes.STRING,
      media_table: DataTypes.STRING,
      media_name: DataTypes.STRING,
      media_hash_name: DataTypes.STRING,
      media_category: DataTypes.STRING,
      media_extensi: DataTypes.STRING,
      media_size: DataTypes.STRING,
      media_url: DataTypes.STRING,
      media_metadata: DataTypes.STRING,
      media_password: DataTypes.STRING,
      media_create_at: DataTypes.DATE,
      media_update_at: DataTypes.DATE,
      media_delete_at: DataTypes.DATE,
      media_create_by: DataTypes.STRING,
      media_update_by: DataTypes.STRING,
      media_delete_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_media",
      tableName: "tbl_media",
      timestamps: false,
      paranoid: true,
    }
  );
  return tbl_media;
};