'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_permissions', {
      permission_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      permission_uuid: {
        type: Sequelize.STRING
      },
      permission_name: {
        type: Sequelize.STRING
      },
      permission_desc: {
        type: Sequelize.STRING
      },
      permission_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      permission_update_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      permission_delete_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      permission_create_by: {
        type: Sequelize.STRING,
      },
      permission_update_by: {
        type: Sequelize.STRING,
      },
      permission_delete_by: {
        type: Sequelize.STRING,
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_permissions');
  }
};