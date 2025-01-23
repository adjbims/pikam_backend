const db = require("../models");
const tbl_levels = db.tbl_levels;
const tbl_user = db.tbl_user;
const tbl_access = db.tbl_access;
const tbl_modules = db.tbl_modules;
const tbl_permissions = db.tbl_permissions;

const cekAccessControl = async (req, res, next) => {
  const uuid = req.userUuid;
  if (!uuid) {
      return res.status(401).json({ msg: "Anda harus login untuk mengakses modul ini." });
  }

  const module = req.originalUrl.split('/')[3];
  let method = req.method.toLowerCase();

  if (method === 'get') {
      method = 'view'
  } else if (method === 'put') {
      method = 'update'
  } else if (method === 'post') {
      method = 'create'
  }
  
  console.log('Modul:', module, 'Metode:', method);

  try {
      const user = await tbl_user.findOne({
          where: { user_uuid: uuid },
          include: [{ model: tbl_levels, as: 'user_level_as' }]
      });

      if (!user) {
          return res.status(404).json({ msg: "User tidak ditemukan" });
      }

      const userLevel = user.user_level_as.level_name; 

      if (userLevel === 'super admin') {
          console.log('Akses diterima untuk super admin');
          return next();
      }

      const accesses = await tbl_access.findAll({
          where: { 
                  access_delete_at: null,
                  '$access_level_as.level_uuid$': user.user_level_as.level_uuid 
              },
          include: [
              { model: tbl_levels, as: 'access_level_as' },
              { model: tbl_modules, as: 'access_module_as' },
              { model: tbl_permissions, as: 'access_permission_as' }
          ]
      });

      const hasAccess = accesses.some(access => {
          return (
              access.access_module_as.module_name === module &&
              access.access_permission_as.permission_name === method
          );
      });

      if (!hasAccess) {
          console.log("User Level:", userLevel);
          console.log('Access Denied:', module, method);
          return res.status(403).json({
            status: false,
            message: "Anda tidak punya hak akses",
            data: null
          });
      }

      console.log('Akses diterima :', module, method);
      next();
  } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

module.exports = { cekAccessControl };
