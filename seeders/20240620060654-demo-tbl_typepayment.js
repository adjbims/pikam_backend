"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("tbl_typepayment", [
      {
        typepayment_uuid: '91b47887-c54a-4be0-894f-de39c9d87dd7',
        typepayment_name: 'Cash',
      
      },
      {
        typepayment_uuid: '5b6c950e-b1d6-4aa6-b626-8b3556a14f11',
        typepayment_name: 'Qris',
      },
      {
        typepayment_uuid: 'e6f22dc3-0ce8-479e-887e-4fcd63cf5916',
        typepayment_name: 'Transfer',
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("tbl_typepayment", null, {});
  },
};