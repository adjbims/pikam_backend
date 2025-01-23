const db = require("../models");
const tbl_chair = db.tbl_chair;
const tbl_room = db.tbl_room;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const Joi = require("joi");

const chairSchema = Joi.object({
  chair_room: Joi.string().required().messages({
    'string.empty': 'Kursi ruangan tidak boleh kosong',
  }),
  chair_number: Joi.string().required().messages({
    'string.empty': 'Nomor Kursi tidak boleh kosong',
  }),
  chair_active: Joi.boolean().default(false).messages({
    'boolean.empty': 'Status tidak boleh kosong',
  }),
});

const updatechairSchema = Joi.object({
      chair_room: Joi.string().required().messages({
        'string.empty': 'Kursi ruangan tidak boleh kosong',
      }),
      chair_number: Joi.string().required().messages({
        'string.empty': 'Nomor Kursi tidak boleh kosong',
      }),
      chair_active: Joi.boolean().default(false).messages({
        'boolean.empty': 'Status tidak boleh kosong',
      }),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    chair_number: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const uuidSchema = Joi.object({
  chair_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
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

const post_chair = async (req, res) => {
  try {
    const { error, value } = chairSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      chair_room,
      chair_number,
      chair_active,
    } = value || {};

    const existingchair = await tbl_chair.findOne({
      where: {
        chair_number: chair_number,
        chair_room: chair_room,
        chair_delete_at: null,
      },
    });

    if (existingchair) {
      return res.status(400).json({
        success: false,
        message:
          "Kursi atau nomor Kursi sudah dibooking",
        data: null,
      });
    }

    if (!chair_number) {
      return res.status(400).json({
        success: false,
        message: "Nomor Kursi tidak boleh kosong",
        data: null,
      });
    }

    const chair_uuid = uuidv4();
    const room = await tbl_room.findOne({
      where: { room_uuid: chair_room },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Ruangan tidak ditemukan",
        data: null,
      });
    }

    const create_chair = await tbl_chair.create({
      chair_uuid: chair_uuid,
      chair_room: chair_room,
      chair_number: chair_number,
      chair_active: chair_active,
    });

    if (!create_chair) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data Kursi",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil menambahkan data chair",
      data: {
        chair_number: create_chair.chair_number,
        chair_active: create_chair.chair_active
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
  }
};

const put_chair = async (req, res) => {
  try {
    const chair_uuid = req.params.chair_uuid;
    const { error, value } = updatechairSchema.validate(req.body);
    const { chair_number } = value || {};

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const update_chair = await tbl_chair.findOne({
      where: { 
        chair_uuid,
        chair_delete_at: null,
      },
    });

    if (!update_chair) {
      return res.status(404).json({
        success: false,
        message: "Nomor Kursi tidak ditemukan",
        data: null,
      });
    }

    const existingChair = await tbl_chair.findOne({
      where: {
        chair_number: chair_number,
        chair_delete_at: null,
        chair_uuid: { [Op.ne]: chair_uuid },
      },
    });

    if (existingChair) {
      return res.status(400).json({
        success: false,
        message: "Kursi atau nomor Kursi sudah dibooking",
        data: null,
      });
    }

    await update_chair.update({
      chair_room: value.chair_room || update_chair.chair_room,
      chair_number: value.chair_number || update_chair.chair_number,
      chair_active: value.chair_active,
      chair_update_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        chair_number: update_chair.chair_number,
        chair_active: update_chair.chair_active,
        chair_create_at: update_chair.chair_create_at,
        chair_update_at: update_chair.chair_update_at,
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

const delete_chair = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { chair_uuid } = value;

    const delete_chair = await tbl_chair.findOne({
      where: { chair_uuid },
    });

    if (!delete_chair) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data Kursi",
        data: null,
      });
    }

    await delete_chair.update({ chair_delete_at: new Date() });

    // await tbl_room.update(
    //   { room_delete_at: new Date() },
    //   { where: { room_uuid_chair: chair_uuid, room_chair: "chair" } }
    // );

    res.json({
      success: true,
      message: "Sukses menghapus data Kursi dan data room terkait",
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

const get_detail_chair = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { chair_uuid } = value;

    const detail_chair = await tbl_chair.findOne({
      where: {
        chair_uuid,
        chair_delete_at: null,
      },
    });

    if (!detail_chair) {
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
        chair_room: detail_chair.chair_room,
        chair_number: detail_chair.chair_number,
        chair_active: detail_chair.chair_active,
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

const get_all_chair = async (req, res) => {
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
      order = { chair_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      chair_delete_at: null,
    };

    if (filter.chair_room) {
      const filterNames = Array.isArray(filter.chair_room)
        ? filter.chair_room
        : filter.chair_room.split(",");

      if (filterNames.length > 0) {
        whereClause.chair_room = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.chair_name");
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

      whereClause.chair_room = whereClause.chair_room
        ? { [Sequelize.Op.and]: [whereClause.chair_room, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_chair.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
            model: tbl_room,
            as: 'chair_room_as',
            attributes: ['room_uuid', 'room_name']
        }
    ]
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((chair) => ({
        chair_uuid: chair.chair_uuid,
        chair_number: chair.chair_number,
        chair_active: chair.chair_active,
        chair_room: chair.chair_room_as
        ? {
            room_uuid: chair.chair_room_as.room_uuid,
            room_name: chair.chair_room_as.room_name
        } : null,
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
    const excludePagesUrl = "http://localhost:5000/api/v1/chair/get_all";

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

const get_uniqe_chair = async (req, res) => {
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
    const chairAttributes = tbl_chair.rawAttributes;
    const invalidFields = fieldsArray.filter((f) => !(f in chairAttributes));

    if (invalidFields.length > 0) {
      return res.status(200).json({
        success: false,
        message: "Gagal mendapatkan data",
        data: null,
      });
    }

    const uniqeValues = {};

    for (const f of fieldsArray) {
      const values = await tbl_chair.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(f)), f]],
        where: {
          chair_delete_at: null,
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

const get_count_chair = async (req, res) => {
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
          const count = await tbl_chair.count({
            where: {
              [fieldName]: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.eq]: value,
              },
              chair_delete_at: null,
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
  post_chair,
  put_chair,
  delete_chair,
  get_detail_chair,
  get_all_chair,
  get_uniqe_chair,
  get_count_chair,
};