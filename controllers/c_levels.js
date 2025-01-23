const db = require("../models");
const tbl_levels = db.tbl_levels;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const Joi = require("joi");

const levelSchema = Joi.object({
  level_name: Joi.string().required().messages({
    "string.empty": "Nama tidak boleh kosong",
  }),
});

const updateLevelSchema = Joi.object({
  level_name: Joi.string().required().messages({
    "string.empty": "Nama tidak boleh kosong",
  }),
});

const uuidSchema = Joi.object({
  level_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    level_name: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
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

// Untuk CREATE Datanya
const post_levels = async (req, res) => {
  try {
    const { error, value } = levelSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }
    const { level_name } = value;
    const level_uuid = uuidv4();

    const new_levels = await tbl_levels.create({
      level_uuid: level_uuid,
      level_name: level_name,
    });

    if (!new_levels) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Sukses menambah data",
      data: {
        level_uuid: new_levels.level_uuid,
        level_name: new_levels.level_name,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// Untuk Edit Datanya (Perbaikan)
const put_levels = async (req, res) => {
  try {
    const level_uuid = req.params.level_uuid;

    const { error, value } = updateLevelSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const update_levels = await tbl_levels.findOne({
      where: { level_uuid },
    });

    if (!update_levels) {
      return res.status(404).json({
        success: false,
        message: "Gagal merubah data",
        data: null,
      });
    }

    await update_levels.update({
      level_name: value.level_name,
      level_update_at: new Date(),
    });

    res.json({
      success: true,
      message: "Sukses merubah data",
      data: {
        level_name: update_levels.level_name,
        level_create_at: update_levels.level_create_at,
        level_update_at: update_levels.level_update_at,
      },
    });
  } catch (error) {
    console.error(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// Untuk Delete Datanya
const delete_levels = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { level_uuid } = value;

    const delete_levels = await tbl_levels.findOne({
      where: { level_uuid },
    });

    if (!delete_levels) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data",
        data: null,
      });
    }

    await delete_levels.update({ level_delete_at: new Date() });

    res.json({
      success: true,
      message: "Sukses menghapus data",
    });
  } catch (error) {
    console.log(error, "Data Error");
    res.status(402).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// Untuk Menampilkan datanya berdasarkan UUID
const get_detail_level = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { level_uuid } = value;

    const detail_level = await tbl_levels.findOne({
      where: {
        level_uuid,
        level_delete_at: null,
      },
    });

    if (!detail_level) {
      return res.status(404).json({
        success: false,
        message: "Gagal mendapatkan data",
        data: null,
      });
    }

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: {
        level_uuid: detail_level.level_uuid,
        level_name: detail_level.level_name,
      },
    };

    res.json(result);
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// Untuk Menampilkan Seluruh Datanya
const get_all_levels = async (req, res) => {
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
      order = { level_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      level_delete_at: null,
    };

    if (filter.level_name) {
      const filterNames = Array.isArray(filter.level_name)
        ? filter.level_name
        : filter.level_name.split(",");

      if (filterNames.length > 0) {
        whereClause.level_name = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.level_name");
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

      whereClause.level_name = whereClause.level_name
        ? { [Sequelize.Op.and]: [whereClause.level_name, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_levels.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((level) => ({
        level_uuid: level.level_uuid,
        level_name: level.level_name,
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
        success: true,
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
    const excludePagesUrl = "http://localhost:5000/api/v1/level/get_all";

    if (currentUrl === excludePagesUrl) {
      delete result.pages;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// Untuk mendapatkan Data yang uniqe
const get_unique_levels = async (req, res) => {
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

    const tableAttributes = tbl_levels.rawAttributes;

    const invalidFields = fieldsArray.filter((f) => !(f in tableAttributes));

    if (invalidFields.length > 0) {
      return res.status(200).json({
        success: false,
        message: "Gagal mendapatkan data",
        data: null,
      });
    }

    const uniqueValues = {};

    for (const f of fieldsArray) {
      const values = await tbl_levels.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(f)), f]],
        where: {
          level_delete_at: null,
        },
      });

      if (values && values.length > 0) {
        uniqueValues[f] = values.map((item) => item[f]);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Sukses mendapatkan data",
      data: uniqueValues,
    });
  } catch (error) {
    console.error(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const get_count_levels = async (req, res) => {
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
          const count = await tbl_levels.count({
            where: {
              [fieldName]: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.eq]: value,
              },
              level_delete_at: null,
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
  post_levels,
  put_levels,
  delete_levels,
  get_all_levels,
  get_detail_level,
  get_unique_levels,
  get_count_levels,
};
