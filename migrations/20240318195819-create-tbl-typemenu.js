'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_typemenu', {
      typemenu_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      typemenu_uuid: {
        type: Sequelize.STRING
      },
      typemenu_name: {
        type: Sequelize.STRING
      },
      typemenu_image: {
        type: Sequelize.STRING
      },
      typemenu_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      typemenu_update_at: {
        type: Sequelize.DATE
      },
      typemenu_delete_at: {
        type: Sequelize.DATE
      },
      typemenu_create_by: {
        type: Sequelize.STRING
      },
      typemenu_update_by: {
        type: Sequelize.STRING
      },
      typemenu_delete_by: {
        type: Sequelize.STRING
      }
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_typemenu');
  }
};