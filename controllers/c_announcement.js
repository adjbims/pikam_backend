const db = require("../models");
const tbl_announcement = db.tbl_announcement;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const Joi = require("joi");

const announcementSchema = Joi.object({
  announcement_title: Joi.string().required().messages({
    'string.empty': 'title tidak boleh kosong',
  }),
  announcement_desc: Joi.string().required().messages({
    'string.empty': 'Nama lengkap tidak boleh kosong',
  }),
});

const updateannouncementSchema = Joi.object({
  announcement_title: Joi.string().required().messages({
    'string.empty': 'title tidak boleh kosong',
  }),
  announcement_desc: Joi.string().required().messages({
    'string.empty': 'Nama lengkap tidak boleh kosong',
  }),
});


const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    announcement_title: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const uuidSchema = Joi.object({
  announcement_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
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

const post_announcement = async (req, res) => {
  try {
    const { error, value } = announcementSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      announcement_title,
      announcement_desc,
      announcement_banner,
    } = value || {};

    // Cek apakah title sudah ada di database
    const existingannouncement = await tbl_announcement.findOne({
      where: {
        [Op.or]: [{ announcement_title: announcement_title }],
        announcement_delete_at: null,
      },
    });

    // Jika title sudah ada, kirim respons error
    if (existingannouncement) {
      return res.status(400).json({
        success: false,
        message:
          "title atau nomor HP sudah digunakan, silakan gunakan yang lain.",
        data: null,
      });
    }

    if (!announcement_title) {
      return res.status(400).json({
        success: false,
        message: "title tidak boleh kosong",
        data: null,
      });
    }

    // Lanjutkan proses jika title belum ada
    const announcement_uuid = uuidv4();

    const create_announcement = await tbl_announcement.create({
      announcement_uuid: announcement_uuid,
      announcement_title: announcement_title,
      announcement_desc: announcement_desc,
      announcement_banner: announcement_banner,
    });

    if (!create_announcement) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data announcement",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil menambahkan data announcement",
      data: {
        announcement_title: create_announcement.announcement_title,
        announcement_desc: create_announcement.announcement_desc,
        announcement_banner: create_announcement.announcement_banner,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
  }
};

const put_announcement = async (req, res) => {
  try {
    const announcement_uuid = req.params.announcement_uuid;
    const { error, value } = updateannouncementSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    // const existingannouncement =
    //   value.announcement_title || value.announcement_banner
    //     ? await tbl_announcement.findOne({
    //         where: {
    //           [Op.and]: [
    //             {
    //               [Op.or]: [
    //                 ...(value.announcement_title
    //                   ? [{ announcement_title: value.announcement_title }]
    //                   : []),
    //                 ...(value.announcement_banner
    //                   ? [{ announcement_banner: value.announcement_banner }]
    //                   : []),
    //               ],
    //             },
    //             { announcement_uuid: { [Op.ne]: announcement_uuid } },
    //           ],
    //         },
    //       })
    //     : null;

    // if (existingannouncement) {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "title atau banner sudah digunakan, silakan gunakan yang lain.",
    //     data: null,
    //   });
    // }

    const update_announcement = await tbl_announcement.findOne({
      where: { announcement_uuid },
    });

    if (!update_announcement) {
      return res.status(404).json({
        success: false,
        message: "announcement tidak ditemukan",
        data: null,
      });
    }

    await update_announcement.update({
      announcement_title: value.announcement_title || update_announcement.announcement_title,
      announcement_desc: value.announcement_desc || update_announcement.announcement_desc,
      announcement_banner: value.announcement_banner || update_announcement.announcement_banner,
      announcement_update_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        announcement_title: update_announcement.announcement_title,
        announcement_desc: update_announcement.announcement_desc,
        announcement_banner: update_announcement.announcement_banner,
        announcement_create_at: update_announcement.announcement_create_at,
        announcement_update_at: update_announcement.announcement_update_at,
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

const delete_announcement = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { announcement_uuid } = value;

    const delete_announcement = await tbl_announcement.findOne({
      where: { announcement_uuid },
    });

    if (!delete_announcement) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data announcement",
        data: null,
      });
    }

    await delete_announcement.update({ announcement_delete_at: new Date() });

    // await tbl_media.update(
    //   { media_delete_at: new Date() },
    //   { where: { media_uuid_table: announcement_uuid, media_table: "announcement" } }
    // );

    res.json({
      success: true,
      message: "Sukses menghapus data announcement",
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

const get_detail_announcement = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { announcement_uuid } = value;

    const detail_announcement = await tbl_announcement.findOne({
      where: {
        announcement_uuid,
        announcement_delete_at: null,
      },
    });

    if (!detail_announcement) {
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
        announcement_title: detail_announcement.announcement_title,
        announcement_desc: detail_announcement.announcement_desc,
        announcement_banner: detail_announcement.announcement_banner,
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

const get_all_announcement = async (req, res) => {
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
      order = { announcement_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      announcement_delete_at: null,
    };

    if (filter.announcement_title) {
      const filterNames = Array.isArray(filter.announcement_title)
        ? filter.announcement_title
        : filter.announcement_title.split(",");

      if (filterNames.length > 0) {
        whereClause.announcement_title = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.announcement_title");
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

      whereClause.announcement_title = whereClause.announcement_title
        ? { [Sequelize.Op.and]: [whereClause.announcement_title, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_announcement.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((announcement) => ({
        announcement_uuid: announcement.announcement_uuid,
        announcement_title: announcement.announcement_title,
        announcement_desc: announcement.announcement_desc,
        announcement_banner: announcement.announcement_banner,
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
    const excludePagesUrl = "http://localhost:5000/api/v1/announcement/get_all";

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

const get_uniqe_announcement = async (req, res) => {
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
    const tableAttributes = tbl_announcement.rawAttributes;
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
      const values = await tbl_announcement.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(f)), f]],
        where: {
          announcement_delete_at: null,
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

const get_count_announcement = async (req, res) => {
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
          const count = await tbl_announcement.count({
            where: {
              [fieldName]: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.eq]: value,
              },
              announcement_delete_at: null,
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
  post_announcement,
  put_announcement,
  delete_announcement,
  get_detail_announcement,
  get_all_announcement,
  get_uniqe_announcement,
  get_count_announcement,
};