"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_customer.hasOne(models.tbl_media, {
        foreignKey: 'media_uuid_table',
        sourceKey: 'customer_uuid',
        as: "customer_media_as",
      });
      
      tbl_customer.belongsTo(models.tbl_levels, {
        foreignKey: 'customer_level',
        targetKey: 'level_uuid',
        as: "customer_level_as",
      });
      
    }
  }
  tbl_customer.init(
    {
      customer_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      customer_uuid: DataTypes.STRING,
      customer_username: DataTypes.STRING,
      customer_full_name: DataTypes.STRING,
      customer_nohp: DataTypes.STRING,
      customer_email: DataTypes.STRING,
      customer_address: DataTypes.STRING,
      customer_password: DataTypes.STRING,
      customer_level: DataTypes.STRING,
      customer_media: DataTypes.STRING,
      customer_create_at: DataTypes.DATE,
      customer_update_at: DataTypes.DATE,
      customer_delete_at: DataTypes.DATE,
      customer_create_by: DataTypes.STRING,
      customer_update_by: DataTypes.STRING,
      customer_delete_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_customer",
      tableName: "tbl_customer",
      timestamps: false,
    }
  );
  return tbl_customer;
};