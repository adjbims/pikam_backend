"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("tbl_typemenu", [
      {
        typemenu_uuid: '01b88e4a-71c6-440c-99ac-b6115890c0bb',
        typemenu_name: 'Food',
      
      },
      {
        typemenu_uuid: '23abb0b8-6712-4278-9593-ecddf939d1f9',
        typemenu_name: 'Drink',
      },
      {
        typemenu_uuid: 'a2c032d5-c9f7-4981-8350-96b6476b5cd6',
        typemenu_name: 'Snack',
      },
      {
        typemenu_uuid: 'da487d07-1b68-4527-b929-485713d4dc6d',
        typemenu_name: 'Coffee',
      },
      {
        typemenu_uuid: '9b04f877-470e-4cdd-9b48-44539adf67a1',
        typemenu_name: 'Non Coffee',
      },
      {
        typemenu_uuid: 'd0c72605-be00-4e7b-97dd-5ae38f8028c7',
        typemenu_name: 'Mocktail',
      },
      {
        typemenu_uuid: 'c8eeef09-a82b-40b2-bbf2-6e678e4ad32a',
        typemenu_name: 'Noodle',
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("tbl_typemenu", null, {});
  },
};