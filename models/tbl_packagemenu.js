'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_packagemenu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_packagemenu.hasMany(models.tbl_detailpackagemenu, {
        foreignKey: 'detailpackagemenu_packagemenu',
        sourceKey: 'packagemenu_uuid',
        as: 'detailpackagemenu_as',
      });
      tbl_packagemenu.hasMany(models.tbl_detailtransaction, {
        foreignKey: 'detailtransaction_packagemenu',
        targetKey: 'packagemenu_uuid',
        as: 'detailtransactions_packagemenu', // Sesuaikan dengan alias yang Anda gunakan
      });
      tbl_packagemenu.hasOne(models.tbl_media, {
        foreignKey: 'media_uuid_table',
        sourceKey: 'packagemenu_uuid',
        as: 'packagemenu_image_as'
      });// define association here
    }
  }
  tbl_packagemenu.init(
    {
    packagemenu_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER(50),
    },
    packagemenu_uuid: DataTypes.STRING,
    packagemenu_name: DataTypes.STRING,
    packagemenu_description: DataTypes.STRING,
    packagemenu_image: DataTypes.STRING,
    packagemenu_price:  {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
    },
    packagemenu_update_at: DataTypes.DATE,
    packagemenu_create_at: DataTypes.DATE,
    packagemenu_delete_at: DataTypes.DATE,
    packagemenu_create_by: DataTypes.STRING,
    packagemenu_update_by: DataTypes.STRING,
    packagemenu_delete_by: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tbl_packagemenu',
    tableName: 'tbl_packagemenu',
    timestamps: false,
  });
  return tbl_packagemenu;
};