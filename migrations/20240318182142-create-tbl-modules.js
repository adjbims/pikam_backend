'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_modules', {
      module_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50),
      },
      module_uuid: {
        type: Sequelize.STRING
      },
      module_name: {
        type: Sequelize.STRING
      },
      module_desc: {
        type: Sequelize.STRING
      },
      module_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      module_update_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      module_delete_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      module_create_by: {
        type: Sequelize.STRING,
      },
      module_update_by: {
        type: Sequelize.STRING,
      },
      module_delete_by: {
        type: Sequelize.STRING,
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_modules');
  }
};