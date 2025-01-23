'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_user', {
      user_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50)
      },
      user_uuid: {
        type: Sequelize.STRING
      },
      user_username: {
        type: Sequelize.STRING
      },
      user_full_name: {
        type: Sequelize.STRING
      },
      user_nohp: {
        type: Sequelize.STRING
      },
      user_email: {
        type: Sequelize.STRING
      },
      user_password: {
        type: Sequelize.STRING
      },
      user_token: {
        type: Sequelize.TEXT
      },
      user_level: {
        type: Sequelize.STRING
      },
      user_media: {
        type: Sequelize.STRING
      },
      user_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      user_update_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      user_delete_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      user_create_by: {
        type: Sequelize.STRING
      },
      user_update_by: {
        type: Sequelize.STRING
      },
      user_delete_by: {
        type: Sequelize.STRING
      }
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_user');
  }
};