"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("tbl_modules", [
      {
        module_uuid: "4a8e8612-2daf-4ccd-831b-b3d29945dbf8",
        module_name: "room",
        module_desc: null,
      },
      {
        module_uuid: "17c5e83b-0aba-4f11-987e-f49c2f19c975",
        module_name: "user",
        module_desc: null,
      },
      {
        module_uuid: "7e481b7b-07b8-42a5-bd81-3d93697eafda",
        module_name: "announcement",
        module_desc: null,
      },
      {
        module_uuid: "65f8fed5-2a34-476a-9f60-71107dd4cdaa",
        module_name: "table",
        module_desc: null,
      },
      {
        module_uuid: "91281232-e8f7-4fd2-b506-1ff8f8eb2473",
        module_name: "chair",
        module_desc: null,
      },
      {
        module_uuid: "404c00b5-1c1b-48c5-941b-2b5b973eaccd",
        module_name: "menu",
        module_desc: null,
      },
      {
        module_uuid: "f5ee130f-0407-436f-9af4-12a11a647931",
        module_name: "typemenu",
        module_desc: null,
      },
      {
        module_uuid: "2f7aea18-9f19-40dd-85a7-043646260151",
        module_name: "transaction",
        module_desc: null,
      },
      {
        module_uuid: "15710f99-7adc-4dc2-9f40-d5c1cc02c9c9",
        module_name: "typepayment",
        module_desc: null,
      },
      {
        module_uuid: "19694e48-3fd1-4db5-864f-0d57325efabb",
        module_name: "packagemenu",
        module_desc: null,
      },
      {
        module_uuid: "7beaef2f-28ac-4df2-8bb1-81b2d4c8f89f",
        module_name: "customer",
        module_desc: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("tbl_modules", null, {});
  },
};