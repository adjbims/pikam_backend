'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_detailtransaction', {
      detailtransaction_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      detailtransaction_uuid: {
        type: Sequelize.STRING
      },
      detailtransaction_transaction: {
        type: Sequelize.STRING
      },
      detailtransaction_menu: {
        type: Sequelize.STRING
      },
      detailtransaction_qtymenu: {
        type: Sequelize.INTEGER
      },
      detailtransaction_packagemenu: {
        type: Sequelize.STRING
      },
      detailtransaction_qtypackagemenu: {
        type: Sequelize.INTEGER
      },
      detailtransaction_dateorder: {
        type: Sequelize.DATE
      },
      detailtransaction_menucomplate: {
        type: Sequelize.DATE
      },
      detaitransaction_status: {
        type: Sequelize.ENUM('0', '1', '2'),
        defaultValue: '0',
      },
      detailtransaction_desc: {
        type: Sequelize.STRING
      },
      detailtransaction_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      detailtransaction_update_at: {
        type: Sequelize.DATE
      },
      detailtransaction_delete_at: {
        type: Sequelize.DATE
      },
      detailtransaction_create_by: {
        type: Sequelize.STRING
      },
      detailtransaction_update_by: {
        type: Sequelize.STRING
      },
      detailtransaction_delete_by: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_detailtransaction');
  }
};