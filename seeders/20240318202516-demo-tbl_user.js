module.exports = {
  async up(queryInterface, Sequelize) {
    const bcrypt = require('bcrypt');
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash('12345678', saltRounds);

    return queryInterface.bulkInsert('tbl_user', [
      {
        user_uuid: '2ca673d8-5d7b-4de8-a7c9-485985711b31',
        user_username: 'super admin',
        user_full_name: 'superadmin cafe',
        user_nohp: '',
        user_email: 'superadmin@gmail.com',
        user_password: hashedPassword,
        user_create_at: new Date(),
        user_update_at: null,
        user_delete_at: null,
        user_create_by: null,
        user_update_by: null,
        user_delete_by: null,
      },
      {
        user_uuid: 'eb444f29-8eda-44df-84e2-08261d746476',
        user_username: 'admin',
        user_full_name: 'admin cafe',
        user_nohp: '',
        user_email: 'admin@gmail.com',
        user_password: hashedPassword,
        user_create_at: new Date(),
        user_update_at: null,
        user_delete_at: null,
        user_create_by: null,
        user_update_by: null,
        user_delete_by: null,
      },
    ])
    .then(async () => {
      // Ambil UUID untuk level admin, super admin, karyawan dapur, dan karyawan kasir
      const [adminLevel, superAdminLevel, kitchenStaffLevel, cashierLevel] = await Promise.all([
        queryInterface.sequelize.query(
          `SELECT level_uuid FROM tbl_levels WHERE level_name = 'admin';`,
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        ),
        queryInterface.sequelize.query(
          `SELECT level_uuid FROM tbl_levels WHERE level_name = 'super admin';`,
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        ),
        queryInterface.sequelize.query(
          `SELECT level_uuid FROM tbl_levels WHERE level_name = 'karyawan dapur';`,
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        ),
        queryInterface.sequelize.query(
          `SELECT level_uuid FROM tbl_levels WHERE level_name = 'karyawan kasir';`,
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        ),
      ]);
      
      // Gunakan UUID dari tbl_levels untuk menentukan level user berdasarkan nama pengguna
      return queryInterface.bulkUpdate('tbl_user', {
        user_level: Sequelize.literal(`(
          CASE
            WHEN user_username = 'super admin' THEN '${superAdminLevel[0].level_uuid}'
            WHEN user_username = 'admin' THEN '${adminLevel[0].level_uuid}'
            WHEN user_username = 'karyawan dapur' THEN '${kitchenStaffLevel[0].level_uuid}'
            WHEN user_username = 'karyawan kasir' THEN '${cashierLevel[0].level_uuid}'
          END
        )`),
      }, {});
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('tbl_user', null, {});
  },
};
