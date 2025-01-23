"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("tbl_permissions", [
      {
        permission_uuid: 'd3747ede-1dce-4b72-a8fe-417dd44a7538',
        permission_name: 'create',
        permission_desc: 'Menambahkan Data',
      },
      {
        permission_uuid: 'ed7edf03-f96d-4471-bc24-ddebb62aefed',
        permission_name: 'update',
        permission_desc: 'Mengupdate Data',
      },
      {
        permission_uuid: '631700ec-5d9f-4b3a-bfb6-08d77dd55c5f',
        permission_name: 'delete',
        permission_desc: 'Menghapus Data',
      },
      {
        permission_uuid: 'ed4e7617-9ccb-4001-8900-25bf723f7d44',
        permission_name: 'view',
        permission_desc: 'Melihat data',
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("tbl_permissions", null, {});
  },
};