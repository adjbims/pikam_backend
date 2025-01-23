const db = require("../models");
const tbl_table = db.tbl_table;
const tbl_room = db.tbl_room;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const Joi = require("joi");

const tableSchema = Joi.object({
  table_room: Joi.string().required().messages({
    'string.empty': 'Meja ruangan tidak boleh kosong',
  }),
  table_number: Joi.string().required().messages({
    'string.empty': 'Nomor meja tidak boleh kosong',
  }),
  table_active: Joi.boolean().default(false).messages({
    'boolean.empty': 'Status tidak boleh kosong',
  }),
});

const updatetableSchema = Joi.object({
      table_room: Joi.string().required().messages({
        'string.empty': 'Meja ruangan tidak boleh kosong',
      }),
      table_number: Joi.string().required().messages({
        'string.empty': 'Nomor meja tidak boleh kosong',
      }),
      table_active: Joi.boolean().default(false).messages({
        'boolean.empty': 'Status tidak boleh kosong',
      }),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    table_number: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const uuidSchema = Joi.object({
  table_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
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

const post_table = async (req, res) => {
  try {
    const { error, value } = tableSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { table_room, table_number, table_active } = value || {};

    const existingtable = await tbl_table.findOne({
      where: {
        table_number: table_number,
        table_room: table_room,
        table_delete_at: null,
      },
    });

    if (existingtable) {
      return res.status(400).json({
        success: false,
        message: "Nomor meja sudah digunakan di ruangan yang sama",
        data: null,
      });
    }

    if (!table_number) {
      return res.status(400).json({
        success: false,
        message: "Nomor meja tidak boleh kosong",
        data: null,
      });
    }

    const table_uuid = uuidv4();
    const room = await tbl_room.findOne({
      where: { room_uuid: table_room },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Ruangan tidak ditemukan",
        data: null,
      });
    }

    const create_table = await tbl_table.create({
      table_uuid: table_uuid,
      table_room: table_room,
      table_number: table_number,
      table_active: table_active,
    });

    if (!create_table) {
      return res.status(500).json({
        success: false,
        message: "Gagal menambahkan data meja",
        data: null,
      });
    }

    res.status(201).json({
      success: true,
      message: "Berhasil menambahkan data table",
      data: {
        table_number: create_table.table_number,
        table_active: create_table.table_active,
      },
    });
  } catch (error) {
    console.error("Data Error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      data: null,
    });
  }
};

const put_table = async (req, res) => {
  try {
    const table_uuid = req.params.table_uuid;
    const { error, value } = updatetableSchema.validate(req.body);

    const {
      table_number,
    } = value || {};

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const update_table = await tbl_table.findOne({
      where: { 
        table_uuid,
        table_delete_at: null,
       },
    });

    if (!update_table) {
      return res.status(404).json({
        success: false,
        message: "Nomor meja tidak ditemukan",
        data: null,
      });
    }

    const existingTable = await tbl_table.findOne({
      where: {
        [Op.or]: [{ table_number: table_number }],
        table_delete_at: null,
        table_uuid: { [Op.ne]: table_uuid},
      },
    });

    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: "Meja atau nomor Meja sudah dibooking",
        data: null,
      });
    }

    await update_table.update({
      table_room: value.table_room || update_table.table_room,
      table_number: value.table_number || update_table.table_number,
      table_active: value.table_active,
      table_update_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        table_number: update_table.table_number,
        table_active: update_table.table_active,
        table_create_at: update_table.table_create_at,
        table_update_at: update_table.table_update_at,
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

const delete_table = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { table_uuid } = value;

    const delete_table = await tbl_table.findOne({
      where: { table_uuid },
    });

    if (!delete_table) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data meja",
        data: null,
      });
    }

    await delete_table.update({ table_delete_at: new Date() });

    // await tbl_room.update(
    //   { room_delete_at: new Date() },
    //   { where: { room_uuid_table: table_uuid, room_table: "table" } }
    // );

    res.json({
      success: true,
      message: "Sukses menghapus data meja dan data room terkait",
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

const get_detail_table = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { table_uuid } = value;

    const detail_table = await tbl_table.findOne({
      where: {
        table_uuid,
        table_delete_at: null,
      },
    });

    if (!detail_table) {
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
        table_room: detail_table.table_room,
        table_number: detail_table.table_number,
        table_active: detail_table.table_active
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

const get_all_table = async (req, res) => {
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
      order = { table_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      table_delete_at: null,
    };

    if (filter.table_room) {
      const filterNames = Array.isArray(filter.table_room)
        ? filter.table_room
        : filter.table_room.split(",");

      if (filterNames.length > 0) {
        whereClause.table_room = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.table_name");
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

      whereClause.table_room = whereClause.table_room
        ? { [Sequelize.Op.and]: [whereClause.table_room, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_table.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
          model: tbl_room,
          as: 'table_room_as',
          attributes: ['room_uuid', 'room_name']
        }
      ]
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((table) => ({
        table_uuid: table.table_uuid,
        table_number: table.table_number,
        table_active: table.table_active,
        table_room: table.table_room_as
          ? {
              room_uuid: table.table_room_as.room_uuid,
              room_name: table.table_room_as.room_name
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
    const excludePagesUrl = "http://localhost:5000/api/v1/table/get_all";

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


const get_uniqe_table = async (req, res) => {
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
    const tableAttributes = tbl_table.rawAttributes;
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
      const values = await tbl_table.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(f)), f]],
        where: {
          table_delete_at: null,
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

const get_count_table = async (req, res) => {
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
          const count = await tbl_table.count({
            where: {
              [fieldName]: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.eq]: value,
              },
              table_delete_at: null,
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
  post_table,
  put_table,
  delete_table,
  get_detail_table,
  get_all_table,
  get_uniqe_table,
  get_count_table,
};