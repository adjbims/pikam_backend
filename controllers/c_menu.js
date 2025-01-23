const db = require("../models");
const tbl_menu = db.tbl_menu;
const tbl_typemenu = db.tbl_typemenu;
const tbl_media = db.tbl_media;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const fs = require("fs");
const { Op } = require("sequelize");
const Joi = require("joi");

const menuSchema = Joi.object({
  menu_name: Joi.string().required().messages({
    'string.empty': 'Menu tidak boleh kosong',
  }),
  menu_statusavailable: Joi.boolean().default(false).messages({
    'boolean.empty': 'Status tidak boleh kosong',
}),
  menu_description: Joi.string().required().messages({
    'string.empty': 'Deskripsi tidak boleh kosong',
  }),
  menu_quantity: Joi.number().default("0").required().messages({
  }),
  menu_price: Joi.number().default("0").required().messages({ 
    'number.empty': 'Harga tidak boleh kosong',
  }),
  menu_typemenu: Joi.string().required().messages({
  }),
  menu_recomendation: Joi.boolean().default(false).messages({
    'boolean.empty': 'Rekomendasi tidak boleh kosong',
}),

});

const updatemenuSchema = Joi.object({
  menu_name: Joi.string().required().messages({
    'string.empty': 'Menu tidak boleh kosong',
  }),
  menu_statusavailable: Joi.boolean().default(false).messages({
    'boolean.empty': 'Status tidak boleh kosong',
}),

  menu_description: Joi.string().required().messages({
    'string.empty': 'Deskripsi tidak boleh kosong',
  }),
  menu_quantity: Joi.number().default("0").required().messages({
  }),
  menu_price: Joi.number().default("0").required().messages({ 
    'number.empty': 'Harga tidak boleh kosong',
  }),

  menu_typemenu: Joi.string().required().messages({
  }),
  menu_recomendation: Joi.boolean().default(false).messages({
    'boolean.empty': 'Rekomendasi tidak boleh kosong',
}),

});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    menu_name: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
    menu_statusavailable: Joi.string().valid("true", "false").default("false").optional(),
    menu_quantity: Joi.number().optional(),
    menu_recomendation:Joi.string
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const uuidSchema = Joi.object({
  menu_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
});

const querySchemaByTypemenu = Joi.object({
  menu_business: Joi.string().guid({ version: "uuidv4" }).optional(),
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    menu_name: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
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
    .required(),
});

const querySchemaUniqe = Joi.object({
  field: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9,_]+$")),
});

const post_menu = async (req, res) => {
  try {
    const { error, value } = menuSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      menu_name,
      menu_statusavailable,
      menu_description,
      menu_quantity,
      menu_price,
      menu_typemenu,
      menu_recomendation,
    } = value;

    // Cek apakah menu sudah ada di database
    const existingMenu = await tbl_menu.findOne({
      where: {
        menu_name: menu_name,
        menu_delete_at: null,
      },
    });

    if (existingMenu) {
      return res.status(400).json({
        success: false,
        message: "Menu sudah ada di daftar",
        data: null,
      });
    }

    if (!menu_name) {
      return res.status(400).json({
        success: false,
        message: "Nama menu tidak boleh kosong",
        data: null,
      });
    }

    // Lanjutkan proses jika menu belum ada
    const menu_uuid = uuidv4();

    const createMenu = await tbl_menu.create({
      menu_uuid,
      menu_name,
      menu_statusavailable,
      menu_description,
      menu_quantity,
      menu_price,
      menu_typemenu,
      menu_recomendation,
    });

    if (!createMenu) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data menu",
        data: null,
      });
    }

    // Perbarui media jika ada entri media terkait dengan menu_uuid
    const updateMedia = await tbl_media.findOne({
      where: {
        media_uuid_table: menu_uuid,
      },
    });

    if (updateMedia) {
      await updateMedia.update({
        media_table: "menu",
        media_update_at: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil menambahkan data menu",
      data: {
        menu_name: createMenu.menu_name,
        menu_statusavailable: createMenu.menu_statusavailable,
        menu_description: createMenu.menu_description,
        menu_quantity: createMenu.menu_quantity,
        menu_price: createMenu.menu_price,
        menu_typemenu: createMenu.menu_typemenu,
        menu_recomendation: createMenu.menu_recomendation,
      },
    });
  } catch (error) {
    console.error('Data Error', error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const put_menu = async (req, res) => {
  try {
    const menu_uuid = req.params.menu_uuid;
    const { error, value } = updatemenuSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const update_menu = await tbl_menu.findOne({
      where: { menu_uuid },
    });

    if (!update_menu) {
      return res.status(404).json({
        success: false,
        message: "Menu tidak ditemukan",
        data: null,
      });
    }

    await update_menu.update({
      menu_name: value.menu_name || update_menu.menu_name,
      menu_statusavailable: value.menu_statusavailable || update_menu.menu_statusavailable,
      menu_description: value.menu_description || update_menu.menu_description,
      menu_quantity: value.menu_quantity || update_menu.menu_quantity,
      menu_price: value.menu_price || update_menu.menu_price,
      menu_typemenu: value.menu_typemenu || update_menu.menu_typemenu,
      menu_recomendation: value.menu_recomendation || update_menu.menu_recomendation,
      menu_update_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        menu_name: update_menu.menu_name,
        menu_statusavailable: update_menu.menu_statusavailable,
        menu_description: update_menu.menu_description,
        menu_quantity: update_menu.menu_quantity,
        menu_price: update_menu.menu_price,
        menu_typemenu: update_menu.menu_typemenu,
        menu_recomendation: update_menu.menu_recomendation,
        menu_create_at: update_menu.menu_create_at,
        menu_update_at: update_menu.menu_update_at,
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

const delete_menu = async (req, res) => {
  try {
    // Validasi UUID
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { menu_uuid } = value;

    // Temukan menu yang akan dihapus
    const deleteMenu = await tbl_menu.findOne({
      where: { menu_uuid },
    });

    if (!deleteMenu) {
      return res.status(404).json({
        success: false,
        message: "Menu tidak ditemukan",
        data: null,
      });
    }

    // Perbarui kolom menu_delete_at sebagai soft delete
    await deleteMenu.update({
      menu_delete_at: new Date(),
    });

    // Hapus media yang terkait dengan menu secara fisik dan update kolom media_delete_at
    const deleteMedia = await tbl_media.findAll({
      where: {
        media_uuid_table: menu_uuid,
        media_table: 'menu'
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
          media_uuid_table: menu_uuid,
          media_table: 'menu'
        }
      }
    );

    res.json({
      success: true,
      message: "Sukses menghapus data menu dan media terkait",
    });
  } catch (error) {
    console.error(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const get_detail_menu = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { menu_uuid } = value;

    const detail_menu = await tbl_menu.findOne({
      where: {
        menu_uuid,
        menu_delete_at: null,
      },
      include: [
        {
          model: tbl_media,
          as: "menu_image_as",
          attributes: ["media_uuid", "media_name","media_hash_name", "media_url"],
        },
        {
            model: tbl_typemenu,
            as: 'menu_typemenu_as',
            attributes: ['typemenu_uuid', 'typemenu_name']
        },
      ]
    });

    if (!detail_menu) {
      return res.status(404).json({
        success: false,
        message: "Gagal Mendapatkan Data",
        data: null,
      });
    }

    const result = {
      success: true,
      message: "Berhasil Mendapatkan Data",
      data: {
        menu_name: detail_menu.menu_name,
        menu_statusavailable: detail_menu.menu_statusavailable,
        menu_description: detail_menu.menu_description,
        menu_quantity: detail_menu.menu_quantity,
        menu_price: detail_menu.menu_price,
        menu_image: detail_menu.menu_image_as
          ? {
              media_uuid: detail_menu.menu_image_as.media_uuid,
              media_name: detail_menu.menu_image_as.media_name,
              media_url: `${process.env.URL_MEDIA}${detail_menu.menu_image_as.media_url}`,
              media_hash_name: detail_menu.menu_image_as.media_hash_name,
            }
          : null,
        menu_typemenu: detail_menu.menu_typemenu_as
          ? {
              typemenu_uuid: detail_menu.menu_typemenu_as.typemenu_uuid,
              typemenu_name: detail_menu.menu_typemenu_as.typemenu_name,
            }
          : null,
        menu_recomendation: detail_menu.menu_recomendation
      },
    };

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

const get_all_menu = async (req, res) => {
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
      order = { menu_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      menu_delete_at: null,
    };

    if (filter.menu_name) {
      const filterNames = Array.isArray(filter.menu_name)
        ? filter.menu_name
        : filter.menu_name.split(",");

      if (filterNames.length > 0) {
        whereClause.menu_name = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.menu_name");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }
    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.like]: `%${keyword}%`,
      };
      offset = 0;

      whereClause.menu_name = whereClause.menu_name
        ? { [Sequelize.Op.and]: [whereClause.menu_name, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_menu.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
            model: tbl_typemenu,
            as: 'menu_typemenu_as',
            attributes: ['typemenu_uuid', 'typemenu_name']
        },
        {
          model: tbl_media,
          as: "menu_image_as",
          attributes: ["media_uuid", "media_name","media_hash_name", "media_url"],
        },
      ],
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((menu) => ({
        menu_uuid: menu.menu_uuid,
        menu_name: menu.menu_name,
        menu_statusavailable: menu.menu_statusavailable,
        menu_description: menu.menu_description,
        menu_quantity: menu.menu_quantity,
        menu_price: menu.menu_price,
        menu_image: menu.menu_image_as
          ? {
              media_uuid: menu.menu_image_as.media_uuid,
              media_name: menu.menu_image_as.media_name,
              media_url: menu.menu_image_as.media_url,
              media_hash_name: menu.menu_image_as.media_hash_name,
            }
          : null,
        menu_typemenu: menu.menu_typemenu_as
          ? {
              typemenu_uuid: menu.menu_typemenu_as.typemenu_uuid,
              typemenu_name: menu.menu_typemenu_as.typemenu_name,
            }
          : null,
        menu_recomendation: menu.menu_recomendation,
      })),
      pages: {
        total: data.count,
        per_page: limit || data.count,
        next_page: limit && page ? (page < totalPages ? page + 1 : null) : null,
        to: limit ? offset + data.rows.length : data.count,
        last_page: totalPages,
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
          total: 0,
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
    const excludePagesUrl = "http://localhost:5000/api/v1/menu/get_all";

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

const get_uniqe_menu = async (req, res) => {
  try {
    const { error, value } = querySchemaUniqe.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { field } = value;
    const fieldsArray = field.split(",");
    const tableAttributes = tbl_menu.rawAttributes;
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
      const values = await tbl_menu.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(f)), f]],
        where: {
          menu_delete_at: null,
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


const get_count_menu = async (req, res) => {
  try {
    const { error, value } = querySchemaCount.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { field } = value;

    const counts = {};

    for (const fieldName in field) {
      if (field.hasOwnProperty(fieldName)) {
        const values = Array.isArray(field[fieldName])
          ? field[fieldName]
          : field[fieldName].split(",").map((val) => val.trim());

        const valueCounts = {};

        for (const value of values) {
          const count = await tbl_menu.count({
            where: {
              [fieldName]: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.eq]: value,
              },
              menu_delete_at: null,
            },
          });
          valueCounts[value] = count;
        }

        counts[fieldName] = Object.keys(valueCounts).map((value) => ({
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
  post_menu,
  put_menu,
  delete_menu,
  get_detail_menu,
  get_all_menu,
  get_uniqe_menu,
  get_count_menu,
  // get_menu_byTypemenu,
};