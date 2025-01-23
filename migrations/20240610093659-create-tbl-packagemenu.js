'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_packagemenu', {
      packagemenu_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      packagemenu_uuid: {
        type: Sequelize.STRING
      },
      packagemenu_name: {
        type: Sequelize.STRING
      },
      packagemenu_description: {
        type: Sequelize.STRING
      },
      packagemenu_image: {
        type: Sequelize.STRING
      },
      packagemenu_price: {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
      },
      packagemenu_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      packagemenu_update_at: {
        type: Sequelize.DATE
      },
      packagemenu_delete_at: {
        type: Sequelize.DATE
      },
      packagemenu_create_by: {
        type: Sequelize.STRING
      },
      packagemenu_update_by: {
        type: Sequelize.STRING
      },
      packagemenu_delete_by: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_packagemenu');
  }
};