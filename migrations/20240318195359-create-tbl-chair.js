'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_chair', {
      chair_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      chair_uuid: {
        type: Sequelize.STRING
      },
      chair_room: {
        type: Sequelize.STRING
      },
      chair_number: {
        type: Sequelize.STRING
      },
      chair_active: {
        type: Sequelize.BOOLEAN,
        values: [true, false],
        defaultValue: false
      },
      chair_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      chair_update_at: {
        type: Sequelize.DATE
      },
      chair_delete_at: {
        type: Sequelize.DATE
      },
      chair_create_by: {
        type: Sequelize.STRING
      },
      chair_update_by: {
        type: Sequelize.STRING
      },
      chair_delete_by: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_chair');
  }
};