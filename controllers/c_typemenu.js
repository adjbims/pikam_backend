const db = require("../models");
const tbl_typemenu = db.tbl_typemenu;
const tbl_media = db.tbl_media;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const Joi = require("joi");

const typemenuSchema = Joi.object({
  typemenu_name: Joi.string().required().messages({
    'string.empty': 'Tipe menu tidak boleh kosong',
  }),
});

const updatetypemenuSchema = Joi.object({
  typemenu_name: Joi.string().required().messages({
    'string.empty': 'tipe menu tidak boleh kosong',
  }),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    typemenu_name: Joi.alternatives().try(
      Joi.string().trim(),
      Joi.array().items(Joi.string().trim())
    ).optional(),
  }).optional(),
  order: Joi.object().pattern(
    Joi.string(),
    Joi.string().valid("asc", "desc", "ASC", "DESC")
  ).optional(),
});

const uuidSchema = Joi.object({
  typemenu_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
});

const querySchemaUniqe = Joi.object({
  field: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9,_]+$")),
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

const post_typemenu = async (req, res) => {
  try {
    const { error, value } = typemenuSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      typemenu_name,
    } = value || {};

    // Cek apakah name sudah ada di database
    const existingtypemenu = await tbl_typemenu.findOne({
      where: {
        [Op.or]: [{ typemenu_name: typemenu_name }],
        typemenu_delete_at: null,
      },
    });

    // Jika name sudah ada, kirim respons error
    if (existingtypemenu) {
      return res.status(400).json({
        success: false,
        message:
          "Tipe menu sudah ada, silakan gunakan yang lain.",
        data: null,
      });
    }

    if (!typemenu_name) {
      return res.status(400).json({
        success: false,
        message: "tipe menu tidak boleh kosong",
        data: null,
      });
    }

    // Lanjutkan proses jika name belum ada
    const typemenu_uuid = uuidv4();

    const create_typemenu = await tbl_typemenu.create({
      typemenu_uuid: typemenu_uuid,
      typemenu_name: typemenu_name,
    });

    if (!create_typemenu) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data typemenu",
        data: null,
      });
    }

    // Perbarui media jika ada entri media terkait dengan menu_uuid
    const updateMedia = await tbl_media.findOne({
      where: {
        media_uuid_table: typemenu_uuid,
      },
    });

    if (updateMedia) {
      await updateMedia.update({
        media_table: "typemenu",
        media_update_at: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil menambahkan data typemenu",
      data: {
        typemenu_name: create_typemenu.typemenu_name,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
  }
};

const put_typemenu = async (req, res) => {
  try {
    const typemenu_uuid = req.params.typemenu_uuid;
    const { error, value } = updatetypemenuSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const existingtypemenu =
      value.typemenu_name
        ? await tbl_typemenu.findOne({
            where: {
              [Op.and]: [
                {
                  [Op.or]: [
                    ...(value.typemenu_name
                      ? [{ typemenu_name: value.typemenu_name }]
                      : [])
                  ],
                },
                { typemenu_uuid: { [Op.ne]: typemenu_uuid } },
              ],
            },
          })
        : null;

    if (existingtypemenu) {
      return res.status(400).json({
        success: false,
        message:
          "name atau banner sudah digunakan, silakan gunakan yang lain.",
        data: null,
      });
    }

    const update_typemenu = await tbl_typemenu.findOne({
      where: { typemenu_uuid },
    });

    if (!update_typemenu) {
      return res.status(404).json({
        success: false,
        message: "typemenu tidak ditemukan",
        data: null,
      });
    }

    await update_typemenu.update({
      typemenu_name: value.typemenu_name || update_typemenu.typemenu_name,
      typemenu_update_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        typemenu_name: update_typemenu.typemenu_name,
        typemenu_create_at: update_typemenu.typemenu_create_at,
        typemenu_update_at: update_typemenu.typemenu_update_at,
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

const delete_typemenu = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { typemenu_uuid } = value;

    const delete_typemenu = await tbl_typemenu.findOne({
      where: { typemenu_uuid },
    });

    if (!delete_typemenu) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus tipemenu",
        data: null,
      });
    }

    await delete_typemenu.update({ typemenu_delete_at: new Date() });

    // Hapus media yang terkait dengan menu secara fisik dan update kolom media_delete_at
    const deleteMedia = await tbl_media.findAll({
      where: {
        media_uuid_table: typemenu_uuid,
        media_table: 'typemenu'
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
          media_uuid_table: typemenu_uuid,
          media_table: 'typemenu'
        }
      }
    );
    res.json({
      success: true,
      message: "Sukses menghapus tipemenu dan data media terkait",
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

const get_detail_typemenu = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { typemenu_uuid } = value;

    const detail_typemenu = await tbl_typemenu.findOne({
      where: {
        typemenu_uuid,
        typemenu_delete_at: null,
      },
      include: [
        {
          model: tbl_media,
          as: "typemenu_image_as",
          attributes: ["media_uuid", "media_name","media_hash_name", "media_url"],
        },
      ]
    });

    if (!detail_typemenu) {
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
        typemenu_uuid: detail_typemenu.typemenu_uuid,
        typemenu_name: detail_typemenu.typemenu_name,
        typemenu_image: detail_typemenu.typemenu_image_as
          ? {
              media_uuid: detail_typemenu.typemenu_image_as.media_uuid,
              media_name: detail_typemenu.typemenu_image_as.media_name,
              media_url: detail_typemenu.typemenu_image_as.media_url,
              media_hash_name: detail_typemenu.typemenu_image_as.media_hash_name,
            }
          : null,
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

const get_all_typemenu = async (req, res) => {
  try {
    console.log('Query Parameters:', req.query);
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
      order = { typemenu_uuid: "asc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection = order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      typemenu_delete_at: null,
    };

    if (filter.typemenu_name) {
      const filterNames = Array.isArray(filter.typemenu_name)
        ? filter.typemenu_name
        : filter.typemenu_name.split(",");

      if (filterNames.length > 0) {
        whereClause.typemenu_name = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.typemenu_name");
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

      whereClause.typemenu_name = whereClause.typemenu_name
        ? { [Sequelize.Op.and]: [whereClause.typemenu_name, keywordClause] }
        : keywordClause;
    }

    console.log('Where Clause:', whereClause);

    const data = await tbl_typemenu.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
          model: tbl_media,
          as: "typemenu_image_as",
          attributes: ["media_uuid", "media_name","media_hash_name", "media_url"],
        },
      ]
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    console.log('Data Count:', data.count);

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((typemenu) => ({
        typemenu_uuid: typemenu.typemenu_uuid,
        typemenu_name: typemenu.typemenu_name,
        typemenu_image: typemenu.typemenu_image_as
          ? {
            media_uuid: typemenu.typemenu_image_as.media_uuid,
            media_name: typemenu.typemenu_image_as.media_name,
            media_url: typemenu.typemenu_image_as.media_url,
            media_hash_name: typemenu.typemenu_image_as.media_hash_name,
            }
          : null,
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


const get_uniqe_typemenu = async (req, res) => {
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
    const tableAttributes = tbl_typemenu.rawAttributes;
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
      const values = await tbl_typemenu.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(f)), f]],
        where: {
          typemenu_delete_at: null,
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

const get_count_typemenu = async (req, res) => {
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
          const count = await tbl_typemenu.count({
            where: {
              [fieldName]: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.eq]: value,
              },
              typemenu_delete_at: null,
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
  post_typemenu,
  put_typemenu,
  delete_typemenu,
  get_detail_typemenu,
  get_all_typemenu,
  get_uniqe_typemenu,
  get_count_typemenu,
};