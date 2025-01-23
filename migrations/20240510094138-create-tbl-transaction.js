'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_transaction', {
      transaction_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transaction_uuid: {
        type: Sequelize.STRING
      },
      transaction_code: {
        type: Sequelize.STRING
      },
      transaction_customer: {
        type: Sequelize.STRING
      },
      transaction_date: {
        type: Sequelize.DATE
      },
      transaction_total: {
        type: Sequelize.DOUBLE
      },
      transaction_statustransaction: {
        type: Sequelize.ENUM('0', '1', '2'),
        defaultValue: '0',
      },
      transaction_typepayment: {
        type: Sequelize.STRING
      },
      transaction_statuspayment: {
        type: Sequelize.ENUM("0", "1", "2"),
        defaultValue: "0"
      },
      transaction_discount: {
        type: Sequelize.STRING
      },
      transaction_totalseat: {
        type: Sequelize.INTEGER
      },
      transaction_table: {
        type: Sequelize.STRING
      },
      transaction_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      transaction_update_at: {
        type: Sequelize.DATE
      },
      transaction_delete_at: {
        type: Sequelize.DATE
      },
      transaction_create_by: {
        type: Sequelize.STRING
      },
      transaction_update_by: {
        type: Sequelize.STRING
      },
      transaction_delete_by: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_transaction');
  }
};