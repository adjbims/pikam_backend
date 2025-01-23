'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_room.init(
    {
      room_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
    room_uuid: DataTypes.STRING,
    room_name: DataTypes.STRING,
    room_create_at: DataTypes.DATE,
    room_update_at: DataTypes.DATE,
    room_delete_at: DataTypes.DATE,
    room_create_by: DataTypes.STRING,
    room_update_by: DataTypes.STRING,
    room_delete_by: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tbl_room',
    tableName: 'tbl_room',
    timestamps: false,
  });
  return tbl_room;
};