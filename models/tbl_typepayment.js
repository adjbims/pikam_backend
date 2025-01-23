'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_typepayment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_typepayment.init({
    typepayment_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER(50),
    },
    typepayment_uuid: DataTypes.STRING,
    typepayment_name: DataTypes.STRING,
    typepayment_statusactive: {
      type: DataTypes.BOOLEAN,
      values: [true, false],
      defaultValue: true,
  },
    typepayment_create_at: DataTypes.DATE,
    typepayment_update_at: DataTypes.DATE,
    typepayment_delete_at: DataTypes.DATE,
    typepayment_create_by: DataTypes.STRING,
    typepayment_update_by: DataTypes.STRING,
    typepayment_delete_by: DataTypes.STRING
  }, {
    sequelize,
    modelName: "tbl_typepayment",
    tableName: "tbl_typepayment",
    timestamps: false,
    paranoid: true
  });
  return tbl_typepayment;
};