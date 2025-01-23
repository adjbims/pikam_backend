'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The models/index file will call this method automatically.
     */
    static associate(models) {
      tbl_transaction.belongsTo(models.tbl_typepayment, {
        foreignKey: 'transaction_typepayment',
        targetKey: 'typepayment_uuid',
        as: "transaction_typepayment_as",
      });
      tbl_transaction.hasMany(models.tbl_detailtransaction, {
        foreignKey: 'detailtransaction_transaction', // Nama foreign key dalam tbl_detailtransaction yang merujuk ke transaction_uuid di tbl_transaction
        targetKey: 'transaction_uuid',
        as: 'detailtransaction_as', // Nama asosiasi yang digunakan untuk mengakses detail transaksi dari transaksi
      });
      tbl_transaction.belongsTo(models.tbl_customer, {
        foreignKey: 'transaction_customer',
        targetKey: 'customer_uuid',
        as: 'transaction_customer_as',
      });
      // tbl_transaction.belongsTo(models.tbl_discount, {
      //   foreignKey: 'transaction_discount',
      //   targetKey: 'discount_uuid',
      //   as: "transaction_discount_as",
      // }); //define association here
    }
  }
  tbl_transaction.init({
    transaction_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER(50),
    },
    transaction_uuid: DataTypes.STRING,
    transaction_code: DataTypes.STRING,
    transaction_customer: DataTypes.STRING,
    transaction_date: DataTypes.DATE,
    transaction_total: DataTypes.DOUBLE,
    transaction_statustransaction:  {
      type: DataTypes.ENUM('0', '1', '2'),
      defaultValue: '0'
    },
    transaction_typepayment: DataTypes.STRING,
    transaction_statuspayment: {
      type: DataTypes.ENUM('0', '1', '2'),
      defaultValue: '0'
    },
    transaction_discount: DataTypes.STRING,
    transaction_totalseat: DataTypes.INTEGER,
    transaction_table: DataTypes.STRING,
    transaction_create_at: DataTypes.DATE,
    transaction_update_at: DataTypes.DATE,
    transaction_delete_at: DataTypes.DATE,
    transaction_create_by: DataTypes.STRING,
    transaction_update_by: DataTypes.STRING,
    transaction_delete_by: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'tbl_transaction',
    tableName: 'tbl_transaction',
    timestamps: false,
  });
  return tbl_transaction;
};