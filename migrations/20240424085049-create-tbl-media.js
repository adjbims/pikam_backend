'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_media', {
      media_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50),
      },
      media_uuid: {
        type: Sequelize.STRING
      },
      media_uuid_table: {
        type: Sequelize.STRING
      },
      media_table: {
        type: Sequelize.STRING
      },
      media_name: {
        type: Sequelize.STRING
      },
      media_hash_name: {
        type: Sequelize.STRING
      },
      media_category: {
        type: Sequelize.STRING
      },
      media_extensi: {
        type: Sequelize.STRING
      },
      media_size: {
        type: Sequelize.STRING
      },
      media_url: {
        type: Sequelize.STRING
      },
      media_metadata: {
        type: Sequelize.STRING
      },
      media_password: {
        type: Sequelize.STRING
      },
      media_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      media_update_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      media_delete_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      media_create_by: {
        type: Sequelize.STRING
      },
      media_update_by: {
        type: Sequelize.STRING
      },
      media_delete_by: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_media');
  }
};