'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_customer', {
      customer_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      customer_uuid: {
        type: Sequelize.STRING
      },
      customer_username: {
        type: Sequelize.STRING
      },
      customer_full_name: {
        type: Sequelize.STRING
      },
      customer_nohp: {
        type: Sequelize.STRING
      },
      customer_email: {
        type: Sequelize.STRING
      },
      customer_address: {
        type: Sequelize.STRING
      },
      customer_password: {
        type: Sequelize.STRING
      },
      customer_level: {
        type: Sequelize.STRING
      },
      customer_media: {
        type: Sequelize.STRING
      },
      customer_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      customer_update_at: {
        type: Sequelize.DATE
      },
      customer_delete_at: {
        type: Sequelize.DATE
      },
      customer_create_by: {
        type: Sequelize.STRING
      },
      customer_update_by: {
        type: Sequelize.STRING
      },
      customer_delete_by: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_customers');
  }
};