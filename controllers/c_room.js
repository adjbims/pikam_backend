const db = require("../models");
const tbl_room = db.tbl_room;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const fs = require("fs");
const { Op } = require("sequelize");
const Joi = require("joi");

const roomSchema = Joi.object({
  room_name: Joi.string().required().messages({
    'string.empty': 'room tidak boleh kosong',
  }),
});

const updateroomSchema = Joi.object({
  room_name: Joi.string().required().messages({
    'string.empty': 'room tidak boleh kosong',
  }),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    room_name: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const uuidSchema = Joi.object({
  room_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
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

const post_room = async (req, res) => {
  try {
    const { error, value } = roomSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      room_name,
    } = value || {};

    const existingroom = await tbl_room.findOne({
      where: {
        [Op.or]: [{ room_name: room_name }],
        room_delete_at: null,
      },
    });

    if (existingroom) {
      return res.status(400).json({
        success: false,
        message:
          "room sudah ada di daftar",
        data: null,
      });
    }

    if (!room_name) {
      return res.status(400).json({
        success: false,
        message: "Nama room tidak boleh kosong",
        data: null,
      });
    }

    const room_uuid = uuidv4();

    // const typeroom = await tbl_typeroom.findAll({
    // });

    // if (!typeroom) {
    //   return res.status(404).json({
    //       success: false,
    //       message: "tipe room tidak ditemukan",
    //       data: null
    //   });
    // };

    // const typeroomUuid = typeroom.typeroom_uuid;

    const create_room = await tbl_room.create({
      room_uuid: room_uuid,
      room_name: room_name,
    });

    if (!create_room) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data room",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil menambahkan data room",
      data: {
        room_name: create_room.room_name,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
  }
};

const put_room = async (req, res) => {
  try {
    const room_uuid = req.params.room_uuid;
    const { error, value } = updateroomSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const existingroom =
      value.room_name
        ? await tbl_room.findOne({
            where: {
              [Op.and]: [
                {
                  [Op.or]: [
                    ...(value.room_name
                      ? [{ room_name: value.room_name }]
                      : []),
                  ],
                },
                { room_uuid: { [Op.ne]: room_uuid } },
              ],
            },
          })
        : null;

    if (existingroom) {
      return res.status(400).json({
        success: false,
        message:
          "room sudah ada dalam daftar",
        data: null,
      });
    }

    const update_room = await tbl_room.findOne({
      where: { room_uuid },
    });

    if (!update_room) {
      return res.status(404).json({
        success: false,
        message: "room tidak ditemukan",
        data: null,
      });
    }

    await update_room.update({
      room_name: value.room_name || update_room.room_name,
      room_update_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        room_name: update_room.room_name,
        room_create_at: update_room.room_create_at,
        room_update_at: update_room.room_update_at,
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

const delete_room = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { room_uuid } = value;

    const delete_room = await tbl_room.findOne({
      where: { room_uuid },
    });

    if (!delete_room) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data ruangan",
        data: null,
      });
    }

    await delete_room.update({ room_delete_at: new Date() });

    res.json({
      success: true,
      message: "Sukses menghapus data ruangan",
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

const get_detail_room = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { room_uuid } = value;

    const detail_room = await tbl_room.findOne({
      where: {
        room_uuid,
        room_delete_at: null,
      },
    });

    if (!detail_room) {
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
        room_name: detail_room.room_name,
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

const get_all_room = async (req, res) => {
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
      order = { room_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      room_delete_at: null,
    };

    if (filter.room_name) {
      const filterNames = Array.isArray(filter.room_name)
        ? filter.room_name
        : filter.room_name.split(",");

      if (filterNames.length > 0) {
        whereClause.room_name = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.room_name");
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

      whereClause.room_name = whereClause.room_name
        ? { [Sequelize.Op.and]: [whereClause.room_name, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_room.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((room) => ({
        room_uuid: room.room_uuid,
        room_name: room.room_name,
        // room_statusavailable: room.room_statusavailable,
        // room_description: room.room_description,
        // room_quantity: room.room_quantity,
        // room_typeroom: room.room_typeroom,
        // room_typeroom: room.room_typeroom_as
        // ? {
        //     typeroom_uuid: room.room_typeroom_as.typeroom_uuid,
        //     typeroom_name: room.room_typeroom_as.typeroom_name
        // } : null,
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
    const excludePagesUrl = "http://localhost:5000/api/v1/room/get_all";

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

const get_uniqe_room = async (req, res) => {
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
    const tableAttributes = tbl_room.rawAttributes;
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
      const values = await tbl_room.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(f)), f]],
        where: {
          room_delete_at: null,
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


const get_count_room = async (req, res) => {
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
          const count = await tbl_room.count({
            where: {
              [fieldName]: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.eq]: value,
              },
              room_delete_at: null,
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
  post_room,
  put_room,
  delete_room,
  get_detail_room,
  get_all_room,
  get_uniqe_room,
  get_count_room,
};