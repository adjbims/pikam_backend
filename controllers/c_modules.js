const db = require("../models");
const tbl_modules = db.tbl_modules;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const Joi = require("joi");

const moduleSchema = Joi.object({
  module_name: Joi.string().required().messages({
    'string.empty': 'Nama tidak boleh kosong',
  }),
  module_desc: Joi.string().required().messages({
    'string.empty': 'Nama tidak boleh kosong',
  }),
});

const updatemoduleSchema = Joi.object({
  module_name: Joi.string().required().messages({
    'string.empty': 'Nama tidak boleh kosong',
  }),
  module_desc: Joi.string().required().messages({
    'string.empty': 'Nama tidak boleh kosong',
  }),
});

const uuidSchema = Joi.object({
  module_uuid: Joi.string().guid({ version: 'uuidv4' }).required()
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
      module_name: Joi.alternatives().try(
          Joi.string().trim(),
          Joi.array().items(Joi.string().trim())
      ).optional()
  }).optional(),
  order: Joi.object().pattern(
      Joi.string(), Joi.string().valid('asc', 'desc', 'ASC', 'DESC')
  ).optional()
});

const querySchemaUniqe = Joi.object({
  field: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9,_]+$'))
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


const post_module = async (req, res) => {
    try {
      const {error, value} = moduleSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
          data: null
        })
      }
        const { module_name, module_desc } = value;

        const module_uuid = uuidv4();

        const new_modules = await tbl_modules.create({
            module_uuid: module_uuid,
            module_name: module_name,
            module_desc: module_desc
        })

        if (!new_modules) {
            return res.status(404).json({
                success: false,
                message: 'Gagal menambahkan data',
                data: null,
            })
        }

        res.status(200).json({
            success: true,
            message: 'Sukses Menambahkan data',
            data: {
                module_uuid: new_modules.module_uuid,
                module_name: new_modules.module_name,
                module_desc: new_modules.module_desc
            }
        })
    } catch (error) {
        console.log(error, 'Data Error')
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null
        })
    }
}

const put_module = async (req, res) => {
  try {
    const module_uuid = req.params.module_uuid;

    const { error, value } = updatemoduleSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const update_modules = await tbl_modules.findOne({
      where: {
        module_uuid,
      },
    });

    if (!update_modules) {
      return res.status(404).json({
        success: false,
        message: 'Gagal mengupdate data',
        data: null,
      });
    }

    update_modules.module_name = value.module_name;
    await update_modules.save();

    update_modules.module_desc = value.module_desc;
    await update_modules.save();

    update_modules.module_update_at = new Date();
    await update_modules.save();

    res.status(200).json({
      success: true,
      message: 'Data berhasil diupdate',
      data: {
        module_name: update_modules.module_name,
        module_desc: update_modules.module_desc,
        module_create_at: update_modules.module_create_at,
        module_update_at: update_modules.module_update_at,
      },
    });
  } catch (error) {
    console.error(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null,
    });
  }
};

const delete_module = async (req, res) => {
    try {
      const { error, value } = uuidSchema.validate(req.params);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
          data: null,
        });
      }
  
      const { module_uuid } = value;
        
        const delete_module = await tbl_modules.findOne({
            where: {
                module_uuid,
            }
        })

        if (!delete_module) {
            return res.status(404).json({
                success: false,
                message: 'Gagal menghapus data',
                data: null
            })
        }

        await delete_module.update({module_delete_at: new Date()})

        res.status(200).json({
            success: true,
            message: 'Berhasil menghapus data'
        })
    } catch (error) {
        console.error(error, 'Data Error')
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null
        })
    }
}

const get_all_module = async (req, res) => {
    try {
      const { error, value } = querySchema.validate(req.query);
      if (error) {
          return res.status(400).json({
              success: false,
              message: error.details[0].message,
              data: null
          });
      }
  
      const {
          limit = null,
          page = null,
          keyword = '',
          filter = {},
          order = { module_id: 'desc' }
      } = value;
    
        let offset = limit && order ? (page - 1) * limit : 0;
        const orderField = Object.keys(order)[0];
        const orderDirection = order[orderField]?.toLowerCase() === 'asc' ? 'ASC' : 'DESC'
    
        const whereClause = {
            module_delete_at: null
        }
    
        if (filter.module_name) {
            const filterNames = Array.isArray(filter.module_name)
            ? filter.module_name
            : filter.module_name.split(',');
    
            if (filterNames.length > 0) {
                whereClause.module_name = {
                    [Sequelize.Op.or]: filterNames.map(name => ({
                        [Sequelize.Op.like]: `%${name.trim()}%`
                    })),
                    [Sequelize.Op.not]: null
                }
            } else {
                console.log("Empty filter.module_name");
                return res.status(304).json({
                  success: false,
                  message: 'Data Tidak Di Temukan'
                });
            }
        }
    
        if (keyword) {
            const keywordClause = {
                [Sequelize.Op.like]: `%${keyword}%`,
            }
            offset = 0;
    
            whereClause.module_name = whereClause.module_name
            ? { [Sequelize.Op.and]: [whereClause.module_name, keywordClause]}
            : keywordClause;
        }
    
        const data = await tbl_modules.findAndCountAll({
            where: whereClause,
            order: [[orderField, orderDirection]],
            limit: limit ? parseInt(limit) : null,
            offset: offset ? parseInt(offset) : null,
        })
    
        const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

        const result = {
            success: true,
            message: 'Sukses mendapatkan data',
            data: data.rows.map((module) => ({
                module_uuid: module.module_uuid,
                module_name: module.module_name,
                module_desc: module.module_desc
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

          const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
          const excludePagesUrl = "http://localhost:5000/api/v1/module/get_all";

          if (currentUrl === excludePagesUrl) {
            delete result.pages
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
}

const get_detail_module = async (req, res) => {
    try {
      const { error, value } = uuidSchema.validate(req.params);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
          data: null,
        });
      }
  
      const { module_uuid } = value;

        const detail_module = await tbl_modules.findOne({
            where: {
                module_uuid,
                module_delete_at: null
            }
        })
    
        if (!detail_module) {
            return res.status(404).json({
                success: false,
                message: 'Gagal mendapatkan data',
                data: null
            })
        }

        const result = {
            success: true,
            message: 'Berhasil mendapatkan data',
            data: {
                module_uuid: detail_module.module_uuid,
                module_name: detail_module.module_name,
                module_desc: detail_module.module_desc
            }
        }

        res.status(200).json(result)
    } catch (error) {
        console.error(error, 'Data Error')
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null
        })
    }
}

const get_unique_module = async (req, res) => {
    try {
      const { error, value } = querySchemaUniqe.validate(req.query);
      if (error) {
          return res.status(400).json({
              success: false,
              message: error.details[0].message,
              data: null
          });
      }
  
      const { field } = value;
    
        const fieldsArray = field.split(',');
    
        const tableAttributes = tbl_modules.rawAttributes;
    
        const invalidFields = fieldsArray.filter((f) => !(f in tableAttributes));
    
        if (invalidFields.length > 0) {
          return res.status(200).json({
            success: false,
            message: 'Gagal mendapatkan data',
            data: null
          })
        };
    
        const uniqueValues = {};
    
        for (const f of fieldsArray) {
          const values = await tbl_modules.findAll({
            attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(f)), f]],
            where: {
              module_delete_at: null,
            },
          });
          
          if (values && values.length > 0) {
            uniqueValues[f] = values.map((item) => item[f]);
          }
        }
    
        return res.status(200).json({
          success: true,
          message: 'Sukses mendapatkan data',
          data: uniqueValues,
        });
    
      } catch (error) {
        console.error(error, 'Data Error');
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          data: null,
        });
      }
}

const get_count_module = async (req, res) => {
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
              : field[fieldName].split(',').map((val) => val.trim());
    
            const valueCounts = {}; 
    
            for (const value of values) {
              const count = await tbl_modules.count({
                where: {
                  [fieldName]: {
                    [Sequelize.Op.not]: null,
                    [Sequelize.Op.eq]: value,
                  },
                  module_delete_at: null
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
          message: 'Sukses mendapatkan data',
          data: counts,
        };
    
        return res.status(200).json(response);
      } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          data: null,
        });
      }
}

module.exports = {
    post_module,
    put_module,
    delete_module,
    get_all_module,
    get_detail_module,
    get_unique_module,
    get_count_module
}