'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('tbl_levels', [
      {
        level_uuid: 'c2119049-d099-456a-8597-6b06eec9d9b3',
        level_name: 'super admin',
        level_create_at: new Date(),
        level_update_at: null,
        level_delete_at: null,
        level_create_by: null,
        level_update_by: null,
        level_delete_by: null,
      },
      {
        level_uuid: '9a852219-4356-4cec-a852-d03d20274e9e',
        level_name: 'admin',
        level_create_at: new Date(),
        level_update_at: null,
        level_delete_at: null,
        level_create_by: null,
        level_update_by: null,
        level_delete_by: null,
      },
      {
        level_uuid: '7b061c93-3a7a-4cc9-acd3-8fd302b63379',
        level_name: 'karyawan dapur',
        level_create_at: new Date(),
        level_update_at: null,
        level_delete_at: null,
        level_create_by: null,
        level_update_by: null,
        level_delete_by: null,
      },
      {
        level_uuid: 'defa9a20-13ff-417f-8d39-86aa8bdcf582',
        level_name: 'karyawan kasir',
        level_create_at: new Date(),
        level_update_at: null,
        level_delete_at: null,
        level_create_by: null,
        level_update_by: null,
        level_delete_by: null,
      },
      {
        level_uuid: 'd035282a-480a-4da4-8646-a0bc2e391dcc',
        level_name: 'customer',
        level_create_at: new Date(),
        level_update_at: null,
        level_delete_at: null,
        level_create_by: null,
        level_update_by: null,
        level_delete_by: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('tbl_levels', null, {});
  },
};