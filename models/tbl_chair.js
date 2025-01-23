'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_chair extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_chair.belongsTo(models.tbl_room, {
        foreignKey: 'chair_room',
        targetKey: 'room_uuid',
        as: "chair_room_as",
      });// define association here
    }
  }
  tbl_chair.init(
    {
      chair_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
    chair_uuid: DataTypes.STRING,
    chair_room: DataTypes.STRING,
    chair_number: DataTypes.STRING,
    chair_active: {
      type: DataTypes.BOOLEAN,
      values: [true, false],
      defaultValue: false,
    },
    chair_create_at: DataTypes.DATE,
    chair_update_at: DataTypes.DATE,
    chair_delete_at: DataTypes.DATE,
    chair_create_by: DataTypes.STRING,
    chair_update_by: DataTypes.STRING,
    chair_delete_by: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tbl_chair',
    tableName: 'tbl_chair',
    timestamps: false,
  });
  return tbl_chair;
};