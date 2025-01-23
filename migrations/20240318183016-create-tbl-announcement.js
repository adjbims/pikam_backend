'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_announcement', {
      announcement_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      announcement_uuid: {
        type: Sequelize.STRING
      },
      announcement_title: {
        type: Sequelize.STRING
      },
      announcement_desc: {
        type: Sequelize.STRING
      },
      announcement_banner: {
        type: Sequelize.STRING
      },
      announcement_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      announcement_update_at: {
        type: Sequelize.DATE
      },
      announcement_delete_at: {
        type: Sequelize.DATE
      },
      announcement_create_by: {
        type: Sequelize.STRING
      },
      announcement_update_by: {
        type: Sequelize.STRING
      },
      announcement_delete_by: {
        type: Sequelize.STRING
      }
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_announcement');
  }
};