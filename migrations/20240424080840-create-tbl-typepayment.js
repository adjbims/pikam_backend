'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_typepayment', {
      typepayment_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      typepayment_uuid: {
        type: Sequelize.STRING
      },
      typepayment_name: {
        type: Sequelize.STRING
      },
      typepayment_statusactive: {
        type: Sequelize.BOOLEAN,
        defaultValue:true,
      },
      typepayment_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      typepayment_update_at: {
        type: Sequelize.DATE
      },
      typepayment_delete_at: {
        type: Sequelize.DATE
      },
      typepayment_create_by: {
        type: Sequelize.STRING
      },
      typepayment_update_by: {
        type: Sequelize.STRING
      },
      typepayment_delete_by: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_typepayment');
  }
};