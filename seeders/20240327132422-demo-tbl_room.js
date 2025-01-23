"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("tbl_room", [
      {
        room_uuid: '9594c299-1ded-4b80-a911-baffd83933a9',
        room_name: 'indoor',
      
      },
      {
        room_uuid: '8949e1d1-a15e-4104-9302-38ed488ae179',
        room_name: 'outdoor',
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("tbl_room", null, {});
  },
};