'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_typemenu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_typemenu.hasOne(models.tbl_media, {
        foreignKey: 'media_uuid_table',
        sourceKey: 'typemenu_uuid',
        as: 'typemenu_image_as'
      });// define association here
    }
  }
  tbl_typemenu.init(
    {
      typemenu_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
    typemenu_uuid: DataTypes.STRING,
    typemenu_name: DataTypes.STRING,
    typemenu_image: DataTypes.STRING,
    typemenu_create_at: DataTypes.DATE,
    typemenu_update_at: DataTypes.DATE,
    typemenu_delete_at: DataTypes.DATE,
    typemenu_create_by: DataTypes.STRING,
    typemenu_update_by: DataTypes.STRING,
    typemenu_delete_by: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tbl_typemenu',
    tableName: 'tbl_typemenu',
    timestamps: false,
  });
  return tbl_typemenu;
};