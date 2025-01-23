const db = require("../models");
const tbl_user = db.tbl_user;
const tbl_media = db.tbl_media;
const tbl_levels = db.tbl_levels;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { Op } = require("sequelize");
const Joi = require("joi");

const userSchema = Joi.object({
  user_username: Joi.string().required().messages({
    'string.empty': 'Username tidak boleh kosong',
  }),
  user_full_name: Joi.string().required().messages({
    'string.empty': 'Nama lengkap tidak boleh kosong',
  }),
  user_nohp: Joi.string().required().pattern(/^[0-9]{10,14}$/).messages({
    'string.empty': 'Nomor HP tidak boleh kosong',
    'string.pattern.base': 'Nomor HP harus terdiri dari angka saja dan memiliki panjang minimal 10 dan maksimal 14',
  }),
  user_email: Joi.string().email().required().messages({
    'string.empty': 'Email tidak boleh kosong',
  }),
  user_password: Joi.string().required().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$')).messages({
      'string.empty': 'Password tidak boleh kosong',
      'string.pattern.base': 'Password harus terdiri dari huruf besar, huruf kecil, dan angka, dan minimal 8 karakter',
  }),
  user_level: Joi.string().required().messages({
    'string.empty': 'level tidak boleh kosong',
  }),
});

const updateuserSchema = Joi.object({
  user_username: Joi.string().required().messages({
    'string.empty': 'Username tidak boleh kosong',
  }),
  user_full_name: Joi.string().required().messages({
    'string.empty': 'Nama lengkap tidak boleh kosong',
  }),
  user_nohp: Joi.string().allow("").min(10).max(14),
  // user_address: Joi.string().allow(""),
  user_email: Joi.string().email(),
  'string.empty': 'email tidak boleh kosong',
  // user_password: Joi.string().min(8),
  user_level: Joi.string().required().messages({
    'string.empty': 'level tidak boleh kosong',
  }),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    user_username: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const uuidSchema = Joi.object({
  user_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
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

const post_user = async (req, res) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      user_username,
      user_full_name,
      user_nohp,
      // user_address,
      user_email,
      user_password,
      user_level,
    } = value || {};

    // Cek apakah email sudah ada di database
    const existingUser = await tbl_user.findOne({
      where: {
        [Op.or]: [{ user_email: user_email }, { user_nohp: user_nohp }],
        user_delete_at: null,
      },
    });

    // Jika email sudah ada, kirim respons error
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "Email atau nomor HP sudah digunakan, silakan gunakan yang lain.",
        data: null,
      });
    }

    if (!user_email) {
      return res.status(400).json({
        success: false,
        message: "Email tidak boleh kosong",
        data: null,
      });
    }

    // Lanjutkan proses jika email belum ada
    const user_uuid = uuidv4();
    const hashedPassword = await bcrypt.hash(user_password, saltRounds);

    const level = await tbl_levels.findAll({
    });

    if (!level) {
      return res.status(404).json({
          success: false,
          message: "Level customer tidak ditemukan",
          data: null
      });
    }

    const customerLevelUuid = level.level_uuid;

    const create_user = await tbl_user.create({
      user_uuid: user_uuid,
      user_username: user_username,
      user_full_name: user_full_name,
      user_nohp: user_nohp,
      user_email: user_email,
      // user_address: user_address,
      user_password: hashedPassword,
      user_level: user_level,
    });

    if (!create_user) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data user",
        data: null,
      });
    }

    const create_media = await tbl_media.create({
      media_uuid_table: create_user.user_uuid,
      media_table: "user",
    });

    if (!create_media) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data media",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil menambahkan data user",
      data: {
        user_username: create_user.user_username,
        user_full_name: create_user.user_full_name,
        user_nohp: create_user.user_nohp,
        user_email: create_user.user_email,
        user_level: create_user.user_level,
        // user_address: create_user.user_address,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
  }
};

const put_user = async (req, res) => {
  try {
    const user_uuid = req.params.user_uuid;
    const { error, value } = updateuserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const existinguser =
      value.user_email || value.user_nohp
        ? await tbl_user.findOne({
            where: {
              [Op.and]: [
                {
                  [Op.or]: [
                    ...(value.user_email
                      ? [{ user_email: value.user_email }]
                      : []),
                    ...(value.user_nohp
                      ? [{ user_nohp: value.user_nohp }]
                      : []),
                  ],
                },
                { user_uuid: { [Op.ne]: user_uuid } },
              ],
            },
          })
        : null;

    // if (existinguser) {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "Email atau nomor telepon sudah digunakan, silakan gunakan yang lain.",
    //     data: null,
    //   });
    // }

    const update_user = await tbl_user.findOne({
      where: { user_uuid },
    });

    if (!update_user) {
      return res.status(404).json({
        success: false,
        message: "Pelanggan tidak ditemukan",
        data: null,
      });
    }

    const hashedPassword = value.user_password
      ? await bcrypt.hash(value.user_password, saltRounds)
      : update_user.user_password;

    await update_user.update({
      user_username: value.user_username || update_user.user_username,
      user_full_name: value.user_full_name || update_user.user_full_name,
      user_nohp: value.user_nohp || update_user.user_nohp,
      // user_address: value.user_address || update_user.user_address,
      user_email: value.user_email || update_user.user_email,
      user_level: value.user_level || update_user.user_level,
      user_update_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        user_username: update_user.user_username,
        user_full_name: update_user.user_full_name,
        user_nohp: update_user.user_nohp,
        // user_address: update_user.user_address,
        user_email: update_user.user_email,
        user_level: update_user.user_level,
        user_create_at: update_user.user_create_at,
        user_update_at: update_user.user_update_at,
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

const delete_user = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { user_uuid } = value;

    const delete_user = await tbl_user.findOne({
      where: { user_uuid },
    });

    if (!delete_user) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data pelanggan",
        data: null,
      });
    }

    await delete_user.update({ user_delete_at: new Date() });

    await tbl_media.update(
      { media_delete_at: new Date() },
      { where: { media_uuid_table: user_uuid, media_table: "user" } }
    );

    res.json({
      success: true,
      message: "Sukses menghapus data pelanggan dan data media terkait",
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

const get_detail_user = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { user_uuid } = value;

    const detail_user = await tbl_user.findOne({
      where: {
        user_uuid,
        user_delete_at: null,
      },
      include: [
        {
          model: tbl_levels,
          as: 'user_level_as',
          attributes: ['level_uuid', 'level_name']
        }
      ]
    });

    if (!detail_user) {
      return res.status(404).json({
        success: false,
        message: "Gagal Mendapatkan Data",
        data: null,
      });
    };

    const result = {
      success: true,
      message: "Berhasil Mendapatkan Data",
      data: {
        user_username: detail_user.user_username,
        user_full_name: detail_user.user_full_name,
        user_nohp: detail_user.user_nohp,
        // user_address: detail_user.user_address,
        user_email: detail_user.user_email,
        user_level: detail_user.user_level_as
        ? {
          level_uuid: detail_user.user_level_as.level_uuid,
          level_name: detail_user.user_level_as.level_name
      } : null,
      user_media: detail_user.user_media
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

const get_all_user = async (req, res) => {
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
      order = { user_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      user_delete_at: null,
    };

    if (filter.user_username) {
      const filterNames = Array.isArray(filter.user_username)
        ? filter.user_username
        : filter.user_username.split(",");

      if (filterNames.length > 0) {
        whereClause.user_username = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.user_name");
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

      whereClause.user_username = whereClause.user_username
        ? { [Sequelize.Op.and]: [whereClause.user_username, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_user.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
            model: tbl_levels,
            as: 'user_level_as',
            attributes: ['level_uuid', 'level_name']
        },
        {
          model: tbl_media,
          as: "user_media_as",
          attributes: ["media_uuid", "media_name", "media_hash_name",  "media_url"],
        },
    ]
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((user) => ({
        user_uuid: user.user_uuid,
        user_username: user.user_username,
        user_full_name: user.user_full_name,
        user_nohp: user.user_nohp,
        user_email: user.user_email,
        user_level: user.user_level_as
        ? {
            level_uuid: user.user_level_as.level_uuid,
            level_name: user.user_level_as.level_name
        } : null,
        user_media: user.user_media
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
    const excludePagesUrl = "http://localhost:5000/api/v1/user/get_all";

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

const get_uniqe_user = async (req, res) => {
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
    const tableAttributes = tbl_user.rawAttributes;
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
      const values = await tbl_user.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(f)), f]],
        where: {
          user_delete_at: null,
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

const get_count_user = async (req, res) => {
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
          const count = await tbl_user.count({
            where: {
              [fieldName]: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.eq]: value,
              },
              user_delete_at: null,
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
  post_user,
  put_user,
  delete_user,
  get_detail_user,
  get_all_user,
  get_uniqe_user,
  get_count_user,
};