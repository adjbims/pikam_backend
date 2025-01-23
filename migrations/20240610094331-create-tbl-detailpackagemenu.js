'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_detailpackagemenu', {
      detailpackagemenu_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      detailpackagemenu_uuid: {
        type: Sequelize.STRING
      },
      detailpackagemenu_packagemenu: {
        type: Sequelize.STRING
      },
      detailpackagemenu_menu: {
        type: Sequelize.STRING
      },
      detailpackagemenu_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      detailpackagemenu_update_at: {
        type: Sequelize.DATE
      },
      detailpackagemenu_delete_at: {
        type: Sequelize.DATE
      },
      detailpackagemenu_create_by: {
        type: Sequelize.STRING
      },
      detailpackagemenu_update_by: {
        type: Sequelize.STRING
      },
      detailpackagemenu_delete_by: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_detailpackagemenu');
  }
};