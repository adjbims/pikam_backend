'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class tbl_detailtransaction extends Model {
    static associate(models) {

      tbl_detailtransaction.belongsTo(models.tbl_menu, {
        foreignKey: 'detailtransaction_menu',
        targetKey: 'menu_uuid',
        as: "detailtransaction_menu_as",
      });// define association here
      tbl_detailtransaction.belongsTo(models.tbl_transaction, {
        foreignKey: 'detailtransaction_transaction',
        targetKey: 'transaction_uuid',
        as: "detailtransaction_transaction_as",
      });
      tbl_detailtransaction.belongsTo(models.tbl_packagemenu, {
        foreignKey: 'detailtransaction_packagemenu',
        targetKey: 'packagemenu_uuid',
        as: "detailtransaction_packagemenu_as",
      });
    }
  }
  tbl_detailtransaction.init({
    detailtransaction_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER(50),
    },
    detailtransaction_uuid: DataTypes.STRING,
    detailtransaction_transaction: DataTypes.STRING,
    detailtransaction_menu: DataTypes.STRING,
    detailtransaction_qtymenu: DataTypes.INTEGER,
    detailtransaction_packagemenu: DataTypes.STRING,
    detailtransaction_qtypackagemenu: DataTypes.INTEGER,
    detailtransaction_dateorder: DataTypes.DATE,
    detailtransaction_menucomplate: DataTypes.DATE,
    detaitransaction_status: {
      type: DataTypes.ENUM('0', '1', '2'),
      defaultValue: '0'
    },
    detailtransaction_desc: DataTypes.STRING,
    detailtransaction_create_at: DataTypes.DATE,
    detailtransaction_update_at: DataTypes.DATE,
    detailtransaction_delete_at: DataTypes.DATE,
    detailtransaction_create_by: DataTypes.STRING,
    detailtransaction_update_by: DataTypes.STRING,
    detailtransaction_delete_by: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'tbl_detailtransaction',
    tableName: 'tbl_detailtransaction',
    timestamps: false,
  });
  return tbl_detailtransaction;
};