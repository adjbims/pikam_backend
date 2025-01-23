const db = require("../models");
const tbl_typepayment = db.tbl_typepayment;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const Joi = require("joi");

const typepaymentSchema = Joi.object({
  typepayment_name: Joi.string().required().messages({
    'string.empty': 'Tipe payment tidak boleh kosong',
  }),
});

const updatetypepaymentSchema = Joi.object({
  typepayment_name: Joi.string().required().messages({
    'string.empty': 'tipe payment tidak boleh kosong',
  }),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    typepayment_name: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const uuidSchema = Joi.object({
  typepayment_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
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

const post_typepayment = async (req, res) => {
  try {
    const { error, value } = typepaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      typepayment_name,
    } = value || {};

    // Cek apakah name sudah ada di database
    const existingtypepayment = await tbl_typepayment.findOne({
      where: {
        [Op.or]: [{ typepayment_name: typepayment_name }],
        typepayment_delete_at: null,
      },
    });

    // Jika name sudah ada, kirim respons error
    if (existingtypepayment) {
      return res.status(400).json({
        success: false,
        message:
          "Tipe payment sudah ada, silakan gunakan yang lain.",
        data: null,
      });
    }

    if (!typepayment_name) {
      return res.status(400).json({
        success: false,
        message: "tipe payment tidak boleh kosong",
        data: null,
      });
    }

    // Lanjutkan proses jika name belum ada
    const typepayment_uuid = uuidv4();

    const create_typepayment = await tbl_typepayment.create({
      typepayment_uuid: typepayment_uuid,
      typepayment_name: typepayment_name,
    });

    if (!create_typepayment) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data typepayment",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil menambahkan data typepayment",
      data: {
        typepayment_name: create_typepayment.typepayment_name,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
  }
};

const put_typepayment = async (req, res) => {
  try {
    const typepayment_uuid = req.params.typepayment_uuid;
    const { error, value } = updatetypepaymentSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    // const existingtypepayment =
    //   value.typepayment_name
    //     ? await tbl_typepayment.findOne({
    //         where: {
    //           [Op.and]: [
    //             {
    //               [Op.or]: [
    //                 ...(value.typepayment_name
    //                   ? [{ typepayment_name: value.typepayment_name }]
    //                   : [])
    //               ],
    //             },
    //             { typepayment_uuid: { [Op.ne]: typepayment_uuid } },
    //           ],
    //         },
    //       })
    //     : null;

    // if (existingtypepayment) {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "name atau banner sudah digunakan, silakan gunakan yang lain.",
    //     data: null,
    //   });
    // }

    const update_typepayment = await tbl_typepayment.findOne({
      where: { typepayment_uuid },
    });

    if (!update_typepayment) {
      return res.status(404).json({
        success: false,
        message: "typepayment tidak ditemukan",
        data: null,
      });
    }

    await update_typepayment.update({
      typepayment_name: value.typepayment_name || update_typepayment.typepayment_name,
      typepayment_update_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        typepayment_name: update_typepayment.typepayment_name,
        typepayment_create_at: update_typepayment.typepayment_create_at,
        typepayment_update_at: update_typepayment.typepayment_update_at,
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

const delete_typepayment = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { typepayment_uuid } = value;

    const delete_typepayment = await tbl_typepayment.findOne({
      where: { typepayment_uuid },
    });

    if (!delete_typepayment) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus tipepayment",
        data: null,
      });
    }

    await delete_typepayment.update({ typepayment_delete_at: new Date() });

    // await tbl_media.update(
    //   { media_delete_at: new Date() },
    //   { where: { media_uuid_table: typepayment_uuid, media_table: "typepayment" } }
    // );

    res.json({
      success: true,
      message: "Sukses menghapus tipepayment dan data media terkait",
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

const get_detail_typepayment = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { typepayment_uuid } = value;

    const detail_typepayment = await tbl_typepayment.findOne({
      where: {
        typepayment_uuid,
        typepayment_delete_at: null,
      },
    });

    if (!detail_typepayment) {
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
        typepayment_name: detail_typepayment.typepayment_name,
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

const get_all_typepayment = async (req, res) => {
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
      order = { typepayment_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      typepayment_delete_at: null,
    };

    if (filter.typepayment_name) {
      const filterNames = Array.isArray(filter.typepayment_name)
        ? filter.typepayment_name
        : filter.typepayment_name.split(",");

      if (filterNames.length > 0) {
        whereClause.typepayment_name = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.typepayment_name");
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

      whereClause.typepayment_name = whereClause.typepayment_name
        ? { [Sequelize.Op.and]: [whereClause.typepayment_name, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_typepayment.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((typepayment) => ({
        typepayment_uuid: typepayment.typepayment_uuid,
        typepayment_name: typepayment.typepayment_name,
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
    const excludePagesUrl = "http://localhost:5000/api/v1/typepayment/get_all";

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

const get_uniqe_typepayment = async (req, res) => {
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
    const tableAttributes = tbl_typepayment.rawAttributes;
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
      const values = await tbl_typepayment.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(f)), f]],
        where: {
          typepayment_delete_at: null,
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

const get_count_typepayment = async (req, res) => {
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
          const count = await tbl_typepayment.count({
            where: {
              [fieldName]: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.eq]: value,
              },
              typepayment_delete_at: null,
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
  post_typepayment,
  put_typepayment,
  delete_typepayment,
  get_detail_typepayment,
  get_all_typepayment,
  get_uniqe_typepayment,
  get_count_typepayment,
};