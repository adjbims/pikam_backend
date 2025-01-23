const db = require('../models');
const tbl_customer = db.tbl_customer;
const tbl_media = db.tbl_media;
const tbl_levels = db.tbl_levels;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { Op } = require('sequelize');
const Joi = require('joi');

const customerSchema = Joi.object({
    customer_username: Joi.string().required().messages({
        'string.empty': 'customername tidak boleh kosong',
    }),
    customer_full_name: Joi.string().required().messages({
        'string.empty': 'Nama lengkap tidak boleh kosong',
    }),
    customer_nohp: Joi.string().allow('').min(10).max(14),
    customer_email: Joi.string().email().required().messages({
        'string.empty': 'Email tidak boleh kosong',
    }),
    customer_address: Joi.string().allow(''),
    customer_password: Joi.string().min(8).required().messages({
        'string.empty': 'Password tidak boleh kosong',
    }),
    customer_level: Joi.string().required().messages({
        'string.empty': 'customername tidak boleh kosong',
    }),
});

const updateCustomerSchema = Joi.object({
    customer_username: Joi.string().required().messages({
        'string.empty': 'customername tidak boleh kosong',
    }),
    customer_full_name: Joi.string().required().messages({
        'string.empty': 'Nama lengkap tidak boleh kosong',
    }),
    customer_nohp: Joi.string().allow('').min(10).max(14),
    customer_address: Joi.string().allow(''),
    // customer_email: Joi.string().email(),
    // customer_password: Joi.string().min(8),
});

const querySchema = Joi.object({
    limit: Joi.number().integer().min(1).optional(),
    page: Joi.number().integer().min(1).optional(),
    keyword: Joi.string().trim().optional(),
    filter: Joi.object({
        customer_username: Joi.alternatives().try(
            Joi.string().trim(),
            Joi.array().items(Joi.string().trim())
        ).optional()
    }).optional(),
    order: Joi.object().pattern(
        Joi.string(), Joi.string().valid('asc', 'desc', 'ASC', 'DESC')
    ).optional()
});

// const customerLogin = Joi.object({
//     limit: Joi.number().integer().min(1).optional(),
//     page: Joi.number().integer().min(1).optional(),
//     keyword: Joi.string().trim().optional(),
//     filter: Joi.object({
//         customer_username: Joi.alternatives().try(
//             Joi.string().trim(),
//             Joi.array().items(Joi.string().trim())
//         ).optional()
//     }).optional(),
//     order: Joi.object().pattern(
//         Joi.string(), Joi.string().valid('asc', 'desc', 'ASC', 'DESC')
//     ).optional()
// });

const uuidSchema = Joi.object({
    customer_uuid: Joi.string().guid({ version: 'uuidv4' }).required()
});

const querySchemaUniqe = Joi.object({
    field: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9,_]+$'))
});

const querySchemaCount = Joi.object({
    field: Joi.object().pattern(
        Joi.string(), 
        Joi.alternatives().try(
            Joi.string().trim(),
            Joi.array().items(Joi.string().trim())
        )
    ).required()
});

const post_customer = async (req, res) => {
    try {
        const { error, value } = customerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                data: null
            });
        }

        const {
            customer_username,
            customer_full_name,
            customer_nohp, 
            customer_email,
            customer_address,
            customer_password,
        } = value;

        const existingCustomer = await tbl_customer.findOne({
            where: { 
                [Op.or]: [
                    { customer_email: customer_email },
                    { customer_nohp: customer_nohp },
                ], customer_delete_at: null,
            }
        });
      
        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: "Data sudah digunakan, silakan gunakan email lain.",
                data: existingCustomer,
            });
        }

        const customer_uuid = uuidv4();
        const hashedPassword = await bcrypt.hash(customer_password, saltRounds);

        const level = await tbl_levels.findOne({
            where: { 
                level_name: "customer" }
        });

        if (!level) {
            return res.status(404).json({
                success: false,
                message: "Level customer tidak ditemukan",
                data: null
            });
        }

        const customerLevelUuid = level.level_uuid;

        const create_customer = await tbl_customer.create({
            customer_uuid: customer_uuid,
            customer_username: customer_username,
            customer_full_name: customer_full_name,
            customer_nohp: customer_nohp,
            customer_address: customer_address,
            customer_email: customer_email,
            customer_password: hashedPassword,
            customer_level: customerLevelUuid, // Menetapkan level_uuid ke customer
        });

        if (!create_customer) {
            return res.status(404).json({
                success: false,
                message: 'Gagal menambahkan data pelanggan',
                data: null
            });
        }

        // Perbarui media jika ada entri media terkait dengan menu_uuid
        const create_media = await tbl_media.create({
            media_uuid_table: create_customer.customer_uuid,
            media_table: "customer",
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
            message: 'Berhasil menambahkan data pelanggan dan media',
            data: {
                customer_uuid: create_customer.customer_uuid,
                customer_customername: create_customer.customer_customername,
                customer_full_name: create_customer.customer_full_name,
                customer_nohp: create_customer.customer_nohp,
                customer_address: create_customer.customer_address,
                customer_email: create_customer.customer_email
            }
        });
    } catch (error) {
        console.log(error, 'Data Error');
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null
        });
    }
}

const put_customer = async (req, res) => {
    try {
      const userUuid = req.userUuid; // Mengambil informasi pengguna dari request
      const { error, value } = updateCustomerSchema.validate(req.body);
  
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
          data: null,
        });
      }
  
      // Cari pelanggan berdasarkan userUuid yang sudah login
      const existingCustomer = value.customer_email || value.customer_nohp ? await tbl_customer.findOne({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                ...(value.customer_email ? [{ customer_email: value.customer_email }] : []),
                ...(value.customer_nohp ? [{ customer_nohp: value.customer_nohp }] : [])
              ]
            },
            { customer_uuid: { [Op.ne]: userUuid } }
          ]
        }
      }) : null;
  
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'Email atau nomor telepon sudah digunakan, silakan gunakan yang lain.',
          data: null,
        });
      }
  
      const update_customer = await tbl_customer.findOne({
        where: { customer_uuid: userUuid },
      });
  
      if (!update_customer) {
        return res.status(404).json({
          success: false,
          message: 'Pelanggan tidak ditemukan',
          data: null,
        });
      }
  
      const hashedPassword = value.customer_password ? await bcrypt.hash(value.customer_password, saltRounds) : update_customer.customer_password;
  
      await update_customer.update({
        customer_username: value.customer_username || update_customer.customer_username,
        customer_full_name: value.customer_full_name || update_customer.customer_full_name,
        customer_nohp: value.customer_nohp || update_customer.customer_nohp,
        customer_address: value.customer_address || update_customer.customer_address,
        customer_update_at: new Date(),
      });
  
      res.status(200).json({
        success: true,
        message: 'Berhasil merubah data',
        data: {
          customer_username: update_customer.customer_username,
          customer_full_name: update_customer.customer_full_name,
          customer_nohp: update_customer.customer_nohp,
          customer_address: update_customer.customer_address,
          customer_create_at: update_customer.customer_create_at,
          customer_update_at: update_customer.customer_update_at,
        },
      });
    } catch (error) {
      console.log(error, 'Data Error');
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        data: null,
      });
    }
  };
  

const delete_customer = async (req, res) => {
    try {
        const { error, value } = uuidSchema.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                data: null
            });
        }

        const { customer_uuid } = value;

        const delete_customer = await tbl_customer.findOne({
            where: { customer_uuid }
        });

        if (!delete_customer) {
            return res.status(404).json({
                success: false,
                message: 'Gagal menghapus data pelanggan',
                data: null
            });
        }

        await delete_customer.update({ customer_delete_at: new Date() });

        await tbl_media.update(
            { media_delete_at: new Date() },
            { where: { media_uuid_table: customer_uuid, media_table: 'customer' } }
        );

        res.json({
            success: true,
            message: "Sukses menghapus data pelanggan dan data media terkait",
        });

    } catch (error) {
        console.log(error, 'Data Error');
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null
        });
    }
}

const get_detail_customer = async (req, res) => {
  try {
      const customer_uuid = req.userUuid; // Retrieve the logged-in user's UUID from the request object

      if (!customer_uuid) {
          return res.status(401).json({
              success: false,
              message: 'Pengguna tidak terautentikasi.',
              data: null
          });
      }

      const detail_customer = await tbl_customer.findOne({
          where: {
              customer_uuid,
              customer_delete_at: null
          },
          include: [
              {
                  model: tbl_levels,
                  as: 'customer_level_as',
                  attributes: ['level_uuid', 'level_name']
              },
              {
                  model: tbl_media,
                  as: 'customer_media_as',
                  attributes: ['media_uuid', 'media_name', 'media_hash_name', 'media_url']
              }
          ]
      });

      if (!detail_customer) {
          return res.status(404).json({
              success: false,
              message: 'Gagal Mendapatkan Data',
              data: null
          });
      }

      const result = {
          success: true,
          message: 'Berhasil Mendapatkan Data',
          data: {
              customer_uuid: detail_customer.customer_uuid,
              customer_username: detail_customer.customer_username,
              customer_full_name: detail_customer.customer_full_name,
              customer_nohp: detail_customer.customer_nohp,
              customer_address: detail_customer.customer_address,
              customer_email: detail_customer.customer_email,
              customer_level: detail_customer.customer_level_as ? {
                  level_uuid: detail_customer.customer_level_as.level_uuid,
                  level_name: detail_customer.customer_level_as.level_name
              } : null,
              customer_media: detail_customer.customer_media_as ? {
                  media_uuid: detail_customer.customer_media_as.media_uuid,
                  media_name: detail_customer.customer_media_as.media_name,
                  media_url: detail_customer.customer_media_as.media_url,
                  media_hash_name: detail_customer.customer_media_as.media_hash_name
              } : null
          }
      };

      res.status(200).json(result);
  } catch (error) {
      console.log(error, 'Data Error');
      res.status(500).json({
          success: false,
          message: 'Internal Server Error',
          data: null
      });
  }
};

const get_all_customer = async (req, res) => {
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
            order = { customer_id: 'desc' }
        } = value;

        let offset = limit && page ? (page - 1) * limit : 0;
        const orderField = Object.keys(order)[0];
        const orderDirection = order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

        const whereClause = {
            customer_delete_at: null,
        }

        if (filter.customer_customername) {
            const filterNames = Array.isArray(filter.customer_customername)
            ? filter.customer_customername
            : filter.customer_customername.split(',');

            if (filterNames.length > 0) {
                whereClause.customer_customername = {
                  [Sequelize.Op.or]: filterNames.map(name => ({
                    [Sequelize.Op.like]: `%${name.trim()}%`,
                  })),
                  [Sequelize.Op.not]: null,
                };
              } else {
                console.log("Empty filter.customer_name");
                return res.status(404).json({
                  success: false,
                  message: 'Data Tidak Di Temukan'
                });
              }
        }
        if (keyword) {
            const keywordClause = {
              [Sequelize.Op.like]: `%${keyword}%`,
            };
            offset = 0; 
      
            whereClause.customer_customername = whereClause.customer_customername
              ? { [Sequelize.Op.and]: [whereClause.customer_customername, keywordClause] }
              : keywordClause;
        }

        const data = await tbl_customer.findAndCountAll({
            where: whereClause,
            order: [[orderField, orderDirection]],
            limit: limit ? parseInt(limit) : null,
            offset: offset ? parseInt(offset) : null,
            include: [
                {
                    model: tbl_levels,
                    as: 'customer_level_as',
                    attributes: ['level_uuid', 'level_name']
                },
                {
                  model: tbl_media,
                  as: "customer_media_as",
                  attributes: ["media_uuid", "media_name", "media_hash_name",  "media_url"],
                },
            ]
          });
          
          const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

          const result = {
            success: true,
            message: "Sukses mendapatkan data",
            data: data.rows.map((customer) => ({
                customer_uuid: customer.customer_uuid,
                customer_username: customer.customer_username,
                customer_full_name: customer.customer_full_name,
                customer_nohp: customer.customer_nohp,
                customer_address: customer.customer_address,
                customer_email: customer.customer_email,
                customer_level: customer.customer_level_as
                ? {
                    level_uuid: customer.customer_level_as.level_uuid,
                    level_name: customer.customer_level_as.level_name
                } : null,
                customer_media: customer.customer_media_as
                ? {
                    media_uuid: customer.customer_media_as.media_uuid,
                    media_name: customer.customer_media_as.media_name,
                    media_url: customer.customer_media_as.media_url,
                    media_hash_name: customer.customer_media_as.media_hash_name,
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

          const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
          const excludePagesUrl = "http://localhost:5000/api/v1/customer/get_all";
      
          if (currentUrl === excludePagesUrl) {
            delete result.pages
          }
      
          res.status(200).json(result);
    } catch (error) {
        console.log(error, 'Data Error')
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null
        })
    }
}

const get_uniqe_customer = async (req, res) => {
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
        const tableAttributes = tbl_customer.rawAttributes;
        const invalidFields = fieldsArray.filter((f) => !(f in tableAttributes));
    
        if (invalidFields.length > 0) {
            return res.status(200).json({
                success: false,
                message: 'Gagal mendapatkan data',
                data: null
            })
        }

        const uniqeValues = {};

        for (const f of fieldsArray) {
            const values = await tbl_customer.findAll({
                attributes: [[Sequelize.fn('DISTINCT', Sequelize.col(f)), f]],
                where: {
                    customer_delete_at: null,
                }
            });

            if (values && values.length > 0) {
                uniqeValues[f] = values.map((item) => item[f]);
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Sukses mendapatkan data',
            data: uniqeValues,
        })
    } catch (error) {
        console.log(error, 'Data Error');
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null
        })
    }
}

const get_count_customer = async (req, res) => {
    try {
        const { error, value } = querySchemaCount.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                data: null
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
              const count = await tbl_customer.count({
                where: {
                  [fieldName]: {
                    [Sequelize.Op.not]: null,
                    [Sequelize.Op.eq]: value,
                  },
                  customer_delete_at: null
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

// const get_all_byCustomerLogin = async (req, res) => {
//     const {error, value} = customerLogin.validate(req.query)
//     if (error) {
//         return res.status(400).json({
//             success: false,
//             message: error.details[0].message,
//             data: null
//         });
//     }

// }

module.exports = {
    post_customer,
    put_customer,
    delete_customer,
    get_detail_customer,
    get_all_customer,
    get_uniqe_customer,
    get_count_customer,
}