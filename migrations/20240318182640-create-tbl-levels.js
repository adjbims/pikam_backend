'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tbl_levels", {
      level_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50),
      },
      level_uuid: {
        type: Sequelize.STRING,
      },
      level_name: {
        type: Sequelize.STRING,
      },
      level_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      level_update_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      level_delete_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      level_create_by: {
        type: Sequelize.STRING,
      },
      level_update_by: {
        type: Sequelize.STRING,
      },
      level_delete_by: {
        type: Sequelize.STRING,
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tbl_levels");
  },
};