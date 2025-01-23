const db = require("../models");
const tbl_permissions = db.tbl_permissions;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const Joi = require("joi");

const permissionSchema = Joi.object({
  permission_name: Joi.string().required().messages({
    "string.empty": "Nama tidak boleh kosong",
  }),
  permission_desc: Joi.string().required().messages({
    "string.empty": "deskripsi tidak boleh kosong",
  }),
});

const updatePermissionSchema = Joi.object({
  permission_name: Joi.string().required().messages({
    "string.empty": "Nama tidak boleh kosong",
  }),
  permission_desc: Joi.string().required().messages({
    "string.empty": "deskripsi tidak boleh kosong",
  }),
});

const uuidSchema = Joi.object({
  permission_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    permission_name: Joi.alternatives()
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

const post_permissions = async (req, res) => {
  try {
    const { error, value } = permissionSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }
    const { permission_name, permission_desc } = value || {};
    const permission_uuid = uuidv4();

    const new_permissions = await tbl_permissions.create({
      permission_uuid: permission_uuid,
      permission_name: permission_name,
      permission_desc: permission_desc
    });

    if (!new_permissions) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Sukses Menambahkan data",
      data: {
        permission_uuid: new_permissions.permission_uuid,
        permission_name: new_permissions.permission_name,
        permission_desc: new_permissions.permission_desc,
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

const put_permissions = async (req, res) => {
  try {
    const permission_uuid = req.params.permission_uuid;

    const { error, value } = updatePermissionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }
    // const existingpermission =
    //   value.permission_name || value.permission_desc
    //     ? await tbl_permissions.findOne({
    //         where: {
    //           [Op.and]: [
    //             {
    //               [Op.or]: [
    //                 ...(value.permission_name
    //                   ? [{ permission_name: value.permission_name }]
    //                   : []),
    //                 ...(value.permission_desc
    //                   ? [{ permission_desc: value.permission_desc }]
    //                   : []),
    //               ],
    //             },
    //             { permission_uuid_uuid: { [Op.ne]: permission_uuid } },
    //           ],
    //         },
    //       })
    //     : null;

    //     if (existingpermission) {
    //       return res.status(400).json({
    //         success: false,
    //         message:
    //           "Email atau nomor telepon sudah digunakan, silakan gunakan yang lain.",
    //         data: null,
    //       });
    //     }

    const update_permissions = await tbl_permissions.findOne({
      where: { permission_uuid },
    });

    if (!update_permissions) {
      return res.status(404).json({
        success: false,
        message: "Gagal merubah data",
        data: null,
      });
    }

    await update_permissions.update({
      permission_name: value.permission_name || update_permissions.permission_name,
      permission_desc: value.permission_desc || update_permissions.permission_desc,
      permission_update_at: new Date(),
    });

    res.json({
      success: true,
      message: "Sukses merubah data",
      data: {
        permission_name: update_permissions.permission_name,
        permission_desc: update_permissions.permission_desc,
        permission_create_at: update_permissions.permission_create_at,
        permission_update_at: update_permissions.permission_update_at,
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

const delete_permissions = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { permission_uuid } = value;

    const delete_permissions = await tbl_permissions.findOne({
      where: { permission_uuid },
    });

    if (!delete_permissions) {
      return res.status(404).json({
        success: false,
        message: "Gagal Menghapus data",
        data: null,
      });
    }

    await delete_permissions.update({permission_delete_at: new Date() });

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

const get_all_permissions = async (req, res) => {
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
      order = { permission_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      permission_delete_at: null,
    };

    if (filter.permission_name) {
      const filterNames = Array.isArray(filter.permission_name)
        ? filter.permission_name
        : filter.permission_name.split(",");

      if (filterNames.length > 0) {
        whereClause.permission_name = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.permission_name");
        return res.status(404).json({
          success: false,
          message: "Data tidak di temukan",
        });
      }
    }

    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.like]: `%${keyword}%`,
      };
      offset = 0;

      whereClause.permission_name = whereClause.permission_name
        ? { [Sequelize.Op.and]: [whereClause.permission_name, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_permissions.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
        success: true,
        message: "Sukses mendapatkan data",
        data: data.rows.map((permission) => ({
          permission_uuid: permission.permission_uuid,
          permission_name: permission.permission_name,
          permission_desc: permission.permission_desc,
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
      const excludePagesUrl = "http://localhost:5000/api/v1/permission/get_all";
  
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
  
  const get_detail_permissions = async (req, res) => {
    try {
      const { error, value } = uuidSchema.validate(req.params);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
          data: null,
        });
      }
  
      const { permission_uuid } = value;
  
      const detail_permissions = await tbl_permissions.findOne({
        where: {
          permission_uuid,
          permission_delete_at: null,
        },
      });
  
      if (!detail_permissions) {
        return res.status(404).json({
          success: false,
          message: "Gagal mendapatkan data",
          data: null,
        });
      }
  
      const result = {
        success: true,
        message: "Berhasil mendapatkan data",
        data: {
          permission_uuid: detail_permissions.permission_uuid,
          permission_name: detail_permissions.permission_name,
          permission_desc: detail_permissions.permission_desc,
        },
      };
  
      res.json(result);
    } catch (error) {
      console.log(error, "Data Error");
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        data: null,
      });
    }
  };
  
  const get_unique_permissions = async (req, res) => {
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
      const tableAttributes = tbl_permissions.rawAttributes;
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
        const values = await tbl_permissions.findAll({
          attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(f)), f]],
          where: {
            permission_delete_at: null,
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
        message: "Internal Server Error",
        data: null,
      });
    }
  };
  
  const get_count_permissions = async (req, res) => {
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
        if (field.hasOwnProperty.call(field, fieldName)) {
          const values = Array.isArray(field[fieldName])
            ? field[fieldName]
            : field[fieldName].split(",").map((val) => val.trim());
  
          const valueCounts = {};
  
          for (const value of values) {
            const count = await tbl_permissions.count({
              where: {
                [fieldName]: {
                  [Sequelize.Op.not]: null,
                  [Sequelize.Op.eq]: value,
                },
                permission_delete_at: null,
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
  
      const result = {
        success: true,
        message: "Sukses mendapatkan data",
        data: counts,
      };
  
      return res.status(200).json(result);
    } catch (error) {
      console.error(error, "Data Error");
  
      res.status(500).json({
        success: false,
        message: "Internal server error",
        data: null,
      });
    }
  };
  
  module.exports = {
    post_permissions,
    put_permissions,
    delete_permissions,
    get_all_permissions,
    get_detail_permissions,
    get_unique_permissions,
    get_count_permissions,
  };
  