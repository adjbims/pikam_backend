'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_access', {
      access_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50),
      },
      access_uuid: {
        type: Sequelize.STRING,
      },
      access_module: {
        type: Sequelize.STRING,
      },
      access_permission: {
        type: Sequelize.STRING,
      },
      access_level: {
        type: Sequelize.STRING,
      },
      access_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      access_update_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      access_delete_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      access_create_by: {
        type: Sequelize.STRING,
      },
      access_update_by: {
        type: Sequelize.STRING,
      },
      access_delete_by: {
        type: Sequelize.STRING,
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_access');
  }
};