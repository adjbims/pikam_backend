
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_user.hasOne(models.tbl_media, {
        foreignKey: 'media_uuid_table',
        sourceKey: 'user_uuid',
        as: 'user_media_as'
      });
      
      tbl_user.belongsTo(models.tbl_levels, {
        foreignKey: 'user_level',
        targetKey: 'level_uuid',
        as: 'user_level_as',
      });
    }
    
  }
  tbl_user.init(
    {
      user_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      user_uuid: DataTypes.STRING,
      user_username: DataTypes.STRING,
      user_full_name: DataTypes.STRING,
      user_nohp: DataTypes.STRING,
      user_email: DataTypes.STRING,
      user_password: DataTypes.STRING,
      user_token: DataTypes.TEXT,
      user_level: DataTypes.STRING,
      user_media: DataTypes.STRING,
      user_create_at: DataTypes.DATE,
      user_update_at: DataTypes.DATE,
      user_delete_at: DataTypes.DATE,
      user_create_by: DataTypes.STRING,
      user_update_by: DataTypes.STRING,
      user_delete_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_user",
      tableName: "tbl_user",
      timestamps: false,
      paranoid: true
    }
  );
  return tbl_user;
};
