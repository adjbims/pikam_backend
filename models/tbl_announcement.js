'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_announcements extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_announcements.init(
    {
      announcement_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
    announcement_uuid: DataTypes.STRING,
    announcement_title: DataTypes.STRING,
    announcement_desc: DataTypes.STRING,
    announcement_banner: DataTypes.STRING,
    announcement_create_at: DataTypes.DATE,
    announcement_update_at: DataTypes.DATE,
    announcement_delete_at: DataTypes.DATE,
    announcement_create_by: DataTypes.STRING,
    announcement_update_by: DataTypes.STRING,
    announcement_delete_by: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tbl_announcement',
    tableName: 'tbl_announcement',
    timestamps: false,
  });
  return tbl_announcements;
};