const db = require("../models");
const tbl_packagemenu = db.tbl_packagemenu; // Jika model tbl_packagemenu telah dibuat
const tbl_detailpackagemenu = db.tbl_detailpackagemenu; // Jika model tbl_detail_packagemenu telah dibuat
const tbl_menu = db.tbl_menu; // Jika model tbl_menu
const tbl_media = db.tbl_media; // Jika model t
const tbl_typemenu = db.tbl_typemenu; // Jika model
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const fs = require("fs");
const { Op } = require("sequelize");
const Joi = require("joi");

const updatedetailpackagemenuSchema = Joi.object({
  packagemenu_name: Joi.string().optional().messages({
    'string.base': 'Nama paket harus berupa string',
    'string.empty': 'Nama paket tidak boleh kosong',
    'any.optional': 'Nama paket wajib diisi'
  }),
  packagemenu_description: Joi.string().optional().messages({
    'string.base': 'Deskripsi paket harus berupa string',
    'string.empty': 'Deskripsi paket tidak boleh kosong',
    'any.optional': 'Deskripsi paket wajib diisi'
  }),
  packagemenu_price: Joi.number().optional().messages({
    'number.base': 'Harga paket harus berupa angka',
    'any.optional': 'Harga paket wajib diisi'
  }),
  detailpackagemenu: Joi.array().items(
    Joi.object({
      detailpackagemenu_menu: Joi.string().optional().messages({
        'string.base': 'Menu UUID harus berupa string',
        'string.empty': 'Menu UUID tidak boleh kosong',
        'any.optional': 'Menu UUID wajib diisi'
      })
    })
  ).optional().messages({
    'array.base': 'Detail paket menu harus berupa array',
    'any.optional': 'Detail paket menu wajib diisi'
  })
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    packagemenu_name: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "description", "ASC", "description"))
    .optional(),
});

const uuidSchema = Joi.object({
  packagemenu_uuid: Joi.string().guid({ version: "uuidv4" }).optional(),
});

const querySchemaCount = Joi.object({
  field: Joi.object()
    .pattern(
      Joi.string(),
      Joi.alternatives().try(
        Joi.string().trim(),
        Joi.array().items(Joi.string().trim())
      )
    )
    .optional(),
});

// const querySchemaUniqe = Joi.object({
//   field: Joi.string().optional().pattern(new RegExp("^[a-zA-Z0-9,_]+$")),
// });

const post_packagemenu = async (req, res) => {
  try {
    const { packagemenu_name, packagemenu_description, packagemenu_price, detailpackagemenu } = req.body;

    if (!packagemenu_name || !packagemenu_description || !packagemenu_price) {
      return res.status(400).json({
        success: false,
        message: "Data packagemenu tidak lengkap.",
        data: null,
      });
    }

    if (!Array.isArray(detailpackagemenu) || detailpackagemenu.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data detail transaksi tidak valid.",
        data: null,
      });
    }

    const packagemenu_uuid = uuidv4();

    await Promise.all(detailpackagemenu.map(async (item) => {
      const detailpackagemenu_uuid = uuidv4();

      await tbl_detailpackagemenu.create({
        detailpackagemenu_uuid: detailpackagemenu_uuid,
        detailpackagemenu_packagemenu: packagemenu_uuid,
        detailpackagemenu_menu: item.detailpackagemenu_menu,
      });
    }));

    const create_packagemenu = await tbl_packagemenu.create({
      packagemenu_uuid: packagemenu_uuid,
      packagemenu_name: packagemenu_name,
      packagemenu_description: packagemenu_description,
      packagemenu_price: packagemenu_price,
    });
    // Perbarui media jika ada entri media terkait dengan menu_uuid
    const updateMedia = await tbl_media.findOne({
      where: {
        media_uuid_table: packagemenu_uuid,
      },
    });

    if (updateMedia) {
      await updateMedia.update({
        media_table: "packagemenu",
        media_update_at: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil Menambahkan Paketmenu",
      data: {
        packagemenu_uuid: create_packagemenu.packagemenu_uuid,
        packagemenu_name: create_packagemenu.packagemenu_name,
        packagemenu_description: create_packagemenu.packagemenu_description,
        packagemenu_price: create_packagemenu.packagemenu_price,
      },
    });

  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: null,
    });
  }
};


const put_packagemenu = async (req, res) => {
  try {
    const { packagemenu_uuid } = req.params;
    const { packagemenu_name, packagemenu_description, packagemenu_price, detailpackagemenu } = req.body;

    console.log("Request body:", req.body);

    // Validasi request body menggunakan schema
    const { error, value } = updatedetailpackagemenuSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    // Check if the packagemenu exists
    const packagemenu = await tbl_packagemenu.findOne({
      where: {
        packagemenu_uuid: packagemenu_uuid,
      },
    });

    if (!packagemenu) {
      return res.status(404).json({
        success: false,
        message: "Packagemenu tidak ditemukan",
        data: null,
      });
    }

    // Update the packagemenu
    await packagemenu.update({
      packagemenu_name: value.packagemenu_name,
      packagemenu_description: value.packagemenu_description,
      packagemenu_price: value.packagemenu_price,
      packagemenu_update_at: new Date(), // Update timestamp
    });

    // Update existing detail packagemenu(s)
    for (const dt of detailpackagemenu) {
      const detail = await tbl_detailpackagemenu.findOne({
        where: {
          detailpackagemenu_packagemenu: packagemenu_uuid,
          detailpackagemenu_menu: dt.detailpackagemenu_menu,
        },
      });

      if (detail) {
        await detail.update({
          detailpackagemenu_update_at: new Date(), // Update timestamp
        });
      } else {
        await tbl_detailpackagemenu.create({
          detailpackagemenu_uuid: uuidv4(),
          detailpackagemenu_packagemenu: packagemenu_uuid,
          detailpackagemenu_menu: dt.detailpackagemenu_menu,
          detailpackagemenu_update_at: new Date(), // Set timestamp
        });
      }
    }

    // Fetch updated detail packagemenus
    const updatedDetailPackagemenus = await tbl_detailpackagemenu.findAll({
      where: {
        detailpackagemenu_packagemenu: packagemenu_uuid,
      },
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah detail packagemenu",
      data: {
        packagemenu_uuid: packagemenu.packagemenu_uuid,
        packagemenu_name: packagemenu.packagemenu_name,
        packagemenu_description: packagemenu.packagemenu_description,
        packagemenu_price: packagemenu.packagemenu_price,
        packagemenu_update_at: packagemenu.packagemenu_update_at,
        detailpackagemenu: updatedDetailPackagemenus.map(dt => ({
          detailpackagemenu_uuid: dt.detailpackagemenu_uuid,
          detailpackagemenu_menu: dt.detailpackagemenu_menu,
          detailpackagemenu_update_at: dt.detailpackagemenu_update_at,
        })),
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};


const delete_packagemenu = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { packagemenu_uuid } = value;

    const packagemenu = await tbl_packagemenu.findOne({
      where: { packagemenu_uuid },
    });

    if (!packagemenu) {
      return res.status(404).json({
        success: false,
        message: "Paket menu tidak ditemukan",
        data: null,
      });
    }

        // Hapus media yang terkait dengan menu
        const deleteMedia = await tbl_media.findAll({
          where: {
            media_uuid_table: packagemenu_uuid,
            media_table: 'packagemenu'
          }
        });
    
        for (const media of deleteMedia) {
          const filePath = `./uploads/${media.media_category}/${media.media_hash_name}`;
          fs.unlink(filePath, (error) => {
            if (error) {
              console.error('File gagal dihapus:', error);
            } else {
              console.log('Sukses menghapus file');
            }
          });
        }
    
        // Perbarui status media sebagai dihapus
        await tbl_media.update(
          { media_delete_at: new Date() },
          {
            where: {
              media_uuid_table: packagemenu_uuid,
              media_table: 'packagemenu'
            }
          }
        );
    
        // Hapus menu dari database
        await packagemenu.destroy();

    // Hapus semua detail transaksi yang terkait
    await tbl_detailpackagemenu.destroy({
      where: { detailpackagemenu_packagemenu: packagemenu_uuid }
    });

    // Hapus transaksi
    await tbl_packagemenu.destroy({
      where: { packagemenu_uuid }
    });

    res.json({
      success: true,
      message: "Sukses menghapus paket menu beserta detailnya",
    });
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const get_detail_packagemenu = async (req, res) => {
  try {
    const { packagemenu_uuid } = req.params;

    // Dapatkan paket menu beserta detail paket menu
    const packagemenu = await tbl_packagemenu.findOne({
      where: {
        packagemenu_uuid: packagemenu_uuid,
      },
      include: [
        {
          model: tbl_detailpackagemenu,
          as: 'detailpackagemenu_as',
          attributes: ['detailpackagemenu_uuid', 'detailpackagemenu_packagemenu', 'detailpackagemenu_menu'],
          include: [
            {
              model: tbl_menu,
              as: 'detailpackagemenu_menu_as',
              attributes: ['menu_uuid', 'menu_name', 'menu_statusavailable', 'menu_description', 'menu_quantity', 'menu_price', 'menu_recomendation'],
              include: [
                {
                  model: tbl_typemenu,
                  as: 'menu_typemenu_as',
                  attributes: ['typemenu_uuid', 'typemenu_name'],
                }
              ]
            }
          ]
        },
        {
          model: tbl_media,
          as: 'packagemenu_image_as',
          attributes: ['media_uuid', 'media_name', 'media_url', 'media_hash_name']
        }
      ]
    });

    if (!packagemenu) {
      return res.status(404).json({
        success: false,
        message: "Paket menu tidak ditemukan",
        data: null,
      });
    }

    const result = {
      success: true,
      message: "Berhasil mendapatkan detail paket menu",
      data: {
        packagemenu_uuid: packagemenu.packagemenu_uuid,
        packagemenu_name: packagemenu.packagemenu_name,
        packagemenu_description: packagemenu.packagemenu_description,
        packagemenu_price: packagemenu.packagemenu_price,
        packagemenu_image: packagemenu.packagemenu_image_as ? {
          media_uuid: packagemenu.packagemenu_image_as.media_uuid,
          media_name: packagemenu.packagemenu_image_as.media_name,
          media_url: packagemenu.packagemenu_image_as.media_url,
          media_hash_name: packagemenu.packagemenu_image_as.media_hash_name,
        } : null,
        detailpackagemenus: packagemenu.detailpackagemenu_as.map(detail => ({
          detailpackagemenu_uuid: detail.detailpackagemenu_uuid,
          detailpackagemenu_packagemenu: detail.detailpackagemenu_packagemenu,
          detailpackagemenu_menu: detail.detailpackagemenu_menu_as ? {
            menu_uuid: detail.detailpackagemenu_menu_as.menu_uuid,
            menu_name: detail.detailpackagemenu_menu_as.menu_name,
            menu_statusavailable: detail.detailpackagemenu_menu_as.menu_statusavailable,
            menu_description: detail.detailpackagemenu_menu_as.menu_description,
            menu_quantity: detail.detailpackagemenu_menu_as.menu_quantity,
            menu_price: detail.detailpackagemenu_menu_as.menu_price,
            menu_typemenu: detail.detailpackagemenu_menu_as.menu_typemenu_as ? {
              typemenu_uuid: detail.detailpackagemenu_menu_as.menu_typemenu_as.typemenu_uuid,
              typemenu_name: detail.detailpackagemenu_menu_as.menu_typemenu_as.typemenu_name,
            } : null,
            menu_recomendation: detail.detailpackagemenu_menu_as.menu_recomendation,
          } : null,
        }))
      }
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Data Error:', error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const get_all_packagemenu = async (req, res) => {
  try {
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      limit = null,
      page = null,
      keyword = "",
      filter = {},
      order = { packagemenu_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      packagemenu_delete_at: null,
    };

    if (filter.packagemenu_name) {
      const filtercustomers = Array.isArray(filter.packagemenu_name)
        ? filter.packagemenu_name
        : filter.packagemenu_name.split(",");

      if (filtercustomers.length > 0) {
        whereClause.packagemenu_name = {
          [Sequelize.Op.or]: filtercustomers.map((customer) => ({
            [Sequelize.Op.like]: `%${customer.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.packagemenu_name");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Ditemukan",
        });
      }
    }
    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.like]: `%${keyword}%`,
      };
      offset = 0;

      whereClause.packagemenu_name = whereClause.packagemenu_name
        ? { [Sequelize.Op.and]: [whereClause.packagemenu_name, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_packagemenu.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
          model: tbl_media,
          as: "packagemenu_image_as",
          attributes: ["media_uuid", "media_name", "media_hash_name", "media_url"],
        },
        {
          model: tbl_detailpackagemenu,
          as: "detailpackagemenu_as",
          include: [
            {
              model: tbl_menu,
              as: "detailpackagemenu_menu_as",
              attributes: [
                "menu_uuid",
                "menu_name",
                "menu_statusavailable",
                "menu_description",
                "menu_quantity",
                "menu_price",
                "menu_recomendation"
              ],
              include: [
                {
                  model: tbl_typemenu,
                  as: "menu_typemenu_as",
                  attributes: ["typemenu_uuid", "typemenu_name"],
                },
              ],
            },
          ],
        },
      ],
    });

    const pricePages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((packagemenu) => ({
        packagemenu_uuid: packagemenu.packagemenu_uuid,
        packagemenu_name: packagemenu.packagemenu_name,
        packagemenu_description: packagemenu.packagemenu_description,
        packagemenu_price: packagemenu.packagemenu_price,
        packagemenu_image: packagemenu.packagemenu_image_as
          ? {
              media_uuid: packagemenu.packagemenu_image_as.media_uuid,
              media_name: packagemenu.packagemenu_image_as.media_name,
              media_url: packagemenu.packagemenu_image_as.media_url,
              media_hash_name: packagemenu.packagemenu_image_as.media_hash_name,
            }
          : null,
        detailpackagemenu: packagemenu.detailpackagemenu_as.map((detail) => ({
          detailpackagemenu_uuid: detail.detailpackagemenu_uuid,
          detailpackagemenu_menu: detail.detailpackagemenu_menu_as
            ? {
                menu_uuid: detail.detailpackagemenu_menu_as.menu_uuid,
                menu_name: detail.detailpackagemenu_menu_as.menu_name,
                menu_statusavailable: detail.detailpackagemenu_menu_as.menu_statusavailable,
                menu_description: detail.detailpackagemenu_menu_as.menu_description,
                menu_quantity: detail.detailpackagemenu_menu_as.menu_quantity,
                menu_price: detail.detailpackagemenu_menu_as.menu_price,
                menu_typemenu: detail.detailpackagemenu_menu_as.menu_typemenu_as
                  ? {
                      typemenu_uuid: detail.detailpackagemenu_menu_as.menu_typemenu_as.typemenu_uuid,
                      typemenu_name: detail.detailpackagemenu_menu_as.menu_typemenu_as.typemenu_name,
                    }
                  : null,
                menu_recomendation: detail.detailpackagemenu_menu_as.menu_recomendation,
              }
            : null,
        })),
      })),
      pages: {
        price: data.count,
        per_page: limit || data.count,
        next_page: limit && page ? (page < pricePages ? page + 1 : null) : null,
        to: limit ? offset + data.rows.length : data.count,
        last_page: pricePages,
        current_page: page || 1,
        from: offset,
      },
    };

    if (data.count === 0) {
      return res.status(200).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
        pages: {
          price: 0,
          per_page: limit || 0,
          next_page: null,
          to: 0,
          last_page: 0,
          current_page: page || 1,
          from: 0,
        },
      });
    }

    const currentUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const excludePagesUrl = "http://localhost:5000/api/v1/packagemenu/get_all";

    if (currentUrl === excludePagesUrl) {
      delete result.pages;
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const get_uniqe_packagemenu = async (req, res) => {
  try {
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { field } = value;
    const fieldsArray = field.split(",");
    const tableAttributes = tbl_packagemenu.rawAttributes;
    const invalidFields = fieldsArray.filter((f) => !(f in tableAttributes));

    if (invalidFields.length > 0) {
      return res.status(200).json({
        success: false,
        message: "Gagal mendapatkan data",
        data: null,
      });
    }

    const uniqeValues = {};

    for (const f of fieldsArray) {
      const values = await tbl_packagemenu.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(f)), f]],
        where: {
          packagemenu_delete_at: null,
        },
      });

      if (values && values.length > 0) {
        uniqeValues[f] = values.map((item) => item[f]);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Sukses mendapatkan data",
      data: uniqeValues,
    });
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};


const get_count_packagemenu = async (req, res) => {
  try {
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { field } = value;

    const counts = {};

    for (const fieldcustomer in field) {
      if (field.hasOwnProperty(fieldcustomer)) {
        const values = Array.isArray(field[fieldcustomer])
          ? field[fieldcustomer]
          : field[fieldcustomer].split(",").map((val) => val.trim());

        const valueCounts = {};

        for (const value of values) {
          const count = await tbl_packagemenu.count({
            where: {
              [fieldcustomer]: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.eq]: value,
              },
              packagemenu_delete_at: null,
            },
          });
          valueCounts[value] = count;
        }

        counts[fieldcustomer] = Object.keys(valueCounts).map((value) => ({
          value,
          count: valueCounts[value],
        }));
      }
    }

    const response = {
      success: true,
      message: "Sukses mendapatkan data",
      data: counts,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Internal server error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = {
  post_packagemenu,
  put_packagemenu,
  delete_packagemenu,
  get_detail_packagemenu,
  get_all_packagemenu,
  get_uniqe_packagemenu,
  get_count_packagemenu,
};