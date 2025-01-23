'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_detailpackagemenu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_detailpackagemenu.belongsTo(models.tbl_menu, {
        foreignKey: 'detailpackagemenu_menu',
        targetKey: 'menu_uuid',
        as: "detailpackagemenu_menu_as",
      });

      tbl_detailpackagemenu.belongsTo(models.tbl_packagemenu, {
        foreignKey: 'detailpackagemenu_packagemenu',
        targetKey: 'packagemenu_uuid',
        as: "detailpackagemenu_packagemenu_as",
      });// define association here

    }
  }
  tbl_detailpackagemenu.init(
    {
      detailpackagemenu_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
    detailpackagemenu_uuid: DataTypes.STRING,
    detailpackagemenu_packagemenu: DataTypes.STRING,
    detailpackagemenu_menu:DataTypes.STRING,
    detailpackagemenu_update_at: DataTypes.DATE,
    detailpackagemenu_create_at: DataTypes.DATE,
    detailpackagemenu_delete_at: DataTypes.DATE,
    detailpackagemenu_create_by: DataTypes.STRING,
    detailpackagemenu_update_by: DataTypes.STRING,
    detailpackagemenu_delete_by: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tbl_detailpackagemenu',
    tableName: 'tbl_detailpackagemenu',
    timestamps: false,
  });
  return tbl_detailpackagemenu;
};