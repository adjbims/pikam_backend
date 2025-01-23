'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_room', {
      room_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      room_uuid: {
        type: Sequelize.STRING
      },
      room_name: {
        type: Sequelize.STRING
      },
      room_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      room_update_at: {
        type: Sequelize.DATE
      },
      room_delete_at: {
        type: Sequelize.DATE
      },
      room_create_by: {
        type: Sequelize.STRING
      },
      room_update_by: {
        type: Sequelize.STRING
      },
      room_delete_by: {
        type: Sequelize.STRING
      }
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_room');
  }
};