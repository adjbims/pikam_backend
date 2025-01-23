'use strict';
const { Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class tbl_table extends Model {
    static associate(models) {
      tbl_table.belongsTo(models.tbl_room, {
        foreignKey: 'table_room',
        targetKey: 'room_uuid',
        as: "table_room_as",
      });
    }

    static queryWithLeftJoin() {
      return this.findAll({
        include: [{
          model: sequelize.models.tbl_room,
          as: "table_room_as",
          required: false, // LEFT JOIN
        }],
      });
    }
  }
  tbl_table.init(
    {
      table_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      table_uuid: DataTypes.STRING,
      table_room: DataTypes.STRING,
      table_number: DataTypes.STRING,
      table_active: {
        type: DataTypes.BOOLEAN,
        values: [true, false],
        defaultValue: false,
      },
      table_create_at: DataTypes.DATE,
      table_update_at: DataTypes.DATE,
      table_delete_at: DataTypes.DATE,
      table_create_by: DataTypes.STRING,
      table_update_by: DataTypes.STRING,
      table_delete_by: DataTypes.STRING
    }, {
    sequelize,
    modelName: 'tbl_table',
    tableName: 'tbl_table',
    timestamps: false,
  });
  return tbl_table;
};
