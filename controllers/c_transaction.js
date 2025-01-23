const db = require("../models");
const tbl_typemenu = db.tbl_typemenu;
const tbl_customer = db.tbl_customer;
const tbl_table = db.tbl_table;
const tbl_packagemenu = db.tbl_packagemenu;
const tbl_transaction = db.tbl_transaction; // Jika model tbl_transaction telah dibuat
const tbl_detailtransaction = db.tbl_detailtransaction; // Jika model tbl_detail_transaction telah dibuat
const tbl_menu = db.tbl_menu; // Jika model tbl_menu
const tbl_typepayment = db.tbl_typepayment; // Jika model t
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const fs = require("fs");
const { Op } = require("sequelize");
const Joi = require("joi");
const moment = require('moment-timezone');

const updateDetailTransactionSchema = Joi.object({
  transaction_statustransaction: Joi.string().valid('0', '1', '2').optional(),
  detailTransactions: Joi.array().items(Joi.object({
    detailtransaction_menu: Joi.string().optional(),
    detailtransaction_qtymenu: Joi.number().optional(),
    detailtransaction_desc: Joi.string().optional(),
    detailtransaction_packagemenu: Joi.string().optional(),
    detailtransaction_qtypackagemenu: Joi.number().optional(),
  })).optional(),
});


//   transaction_statuspayment: Joi.enum('0', '1', '2').default(0).messages({
//   }),
// });

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    transaction_customer: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const uuidSchema = Joi.object({
  transaction_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
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

// const querySchemaUniqe = Joi.object({
//   field: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9,_]+$")),
// });

const post_transaction = async (req, res) => {
  try {
    const { detailTransactions, seat, transaction_typepayment, transaction_total, transaction_table } = req.body;
    const userUuid = req.userUuid;

    if (!userUuid) {
      return res.status(401).json({
        success: false,
        message: "Pengguna tidak terautentikasi.",
        data: null,
      });
    }

    if (!Array.isArray(detailTransactions) || detailTransactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data detail transaksi tidak valid.",
        data: null,
      });
    }

    const typeTable = await tbl_table.findOne({
      where: {
        table_uuid: transaction_table
      }
    })

    if (!typeTable) {
      return res.status(400).json({
        success: false,
        message: "Table uuid salah",
        data: null,
      })
    }
    
    const typePayment = await tbl_typepayment.findOne({ where: { typepayment_uuid: transaction_typepayment } });
    if (!typePayment) {
      return res.status(400).json({
        success: false,
        message: "Tipe pembayaran tidak valid.",
        data: null,
      });
    }

    const transaction_uuid = uuidv4();

    const transaction_code = generateUniqueCode(transaction_uuid, new Date());

    const transactionDateFormatted = moment(new Date()).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss');
    console.log('Formatted Transaction Date:', transactionDateFormatted);

    const parsedDate = moment(transactionDateFormatted, 'DD-MM-YYYY HH:mm:ss', true);
    console.log('Parsed Date:', parsedDate.isValid() ? parsedDate.format('DD-MM-YYYY HH:mm:ss') : 'Invalid Date');

    if (!parsedDate.isValid()) {
      throw new Error('Invalid date format');
    }

    const create_transaction = await tbl_transaction.create({
      transaction_uuid: transaction_uuid,
      transaction_code: transaction_code,
      transaction_date: parsedDate.toDate(),
      transaction_total: transaction_total, 
      transaction_customer: userUuid,
      transaction_table: transaction_table, 
      transaction_typepayment: transaction_typepayment, 
      transaction_statustransaction: '0',
      transaction_totalseat: seat.total_seat
    });

    if(!create_transaction){
      res.status(404).json({
        success: false,
        message: "Gagal menambahkan data",
        data: null,
      });
    }


    // Mendefinisikan fungsi getTransactionDate
    async function getTransactionDate(transactionUuid) {
      const transaction = await tbl_transaction.findOne({ where: { transaction_uuid: transactionUuid } });
      const date = transaction ? transaction.transaction_date : new Date();
      return moment(date).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss');
    }

    await Promise.all(detailTransactions.map(async (detailTransaction) => {
      const detailtransaction_uuid = uuidv4();
      const transactionDate = await getTransactionDate(transaction_uuid);

      // Format the transaction date
      const formattedTransactionDate = moment(transactionDate).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm');
      const detailtransaction_dateorder = moment(new Date()).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm');
      console.log('Formatted Detail Transaction Date:', detailtransaction_dateorder); // Debugging log

      // Verify the formatted date
      const parsedDateOrder = moment(detailtransaction_dateorder, 'DD-MM-YYYY HH:mm', true);
      console.log('Parsed Detail Transaction Date:', parsedDateOrder.isValid() ? parsedDateOrder.format('DD-MM-YYYY HH:mm') : 'Invalid Date');

      if (!parsedDateOrder.isValid()) {
        throw new Error('Invalid date format for detailtransaction_dateorder');
      }

      // Handle individual menu items
      if (detailTransaction.detailtransaction_menu) {
        await tbl_detailtransaction.create({
          detailtransaction_uuid: detailtransaction_uuid,
          detailtransaction_transaction: transaction_uuid,
          detailtransaction_menu: detailTransaction.detailtransaction_menu,
          detailtransaction_qtymenu: detailTransaction.detailtransaction_qtymenu,
          detailtransaction_packagemenu: null,
          detailtransaction_qtypackagemenu: null,
          detailtransaction_desc: detailTransaction.detailtransaction_desc,
          detailtransaction_dateorder: parsedDateOrder.toDate(), // Gunakan tanggal yang sudah di-parse
          detailtransaction_status: '0', // Status awal
          detailtransaction_menucomplete: null, // Waktu penyelesaian awal null
        });
      }

      // Handle package menus
      if (detailTransaction.detailtransaction_packagemenu) {
        await tbl_detailtransaction.create({
          detailtransaction_uuid: detailtransaction_uuid,
          detailtransaction_transaction: transaction_uuid,
          detailtransaction_menu: null,
          detailtransaction_qtymenu: null,
          detailtransaction_packagemenu: detailTransaction.detailtransaction_packagemenu,
          detailtransaction_qtypackagemenu: detailTransaction.detailtransaction_qtypackagemenu,
          detailtransaction_dateorder: parsedDateOrder.toDate(),
          detailtransaction_status: '0', // Status awal
          detailtransaction_menucomplete: null, // Waktu penyelesaian awal null
        });
      }
    }));

    res.status(200).json({
      success: true,
      message: "Pesanan sukses dikirim",
      data: {
        transaction_uuid: create_transaction.transaction_uuid,
        transaction_date: moment(create_transaction.transaction_date).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss'),
        transaction_total: create_transaction.transaction_total, // Pastikan totalTransaction disertakan dalam response
        transaction_code: create_transaction.transaction_code,
        transaction_customer: create_transaction.transaction_customer, // Menampilkan informasi pelanggan yang login berdasarkan uuid
        transaction_table: create_transaction.transaction_table, // Menampilkan tipe pembayaran
        transaction_typepayment: create_transaction.transaction_typepayment, // Menampilkan tipe pembayaran
        transaction_statustransaction: create_transaction.transaction_statustransaction, // Status awal
        transaction_totalseat: create_transaction.transaction_totalseat
      },
    });

  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: null,
    });
  }

  function generateUniqueCode(transactionUuid, transactionDate) {
    // Generate 4 random letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomLetters = '';
    for (let i = 0; i < 4; i++) {
      randomLetters += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    // Format the date as YYYYMMDD
    const year = transactionDate.getFullYear();
    const month = String(transactionDate.getMonth() + 1).padStart(2, '0');
    const day = String(transactionDate.getDate()).padStart(2, '0');
    const formattedDate = `${day}${month}${year}`;

    // Combine random letters and formatted date
    const uniqueCode = `${randomLetters}${formattedDate}`;
    return uniqueCode;
  }
};


  function generateUniqueCode(transactionUuid, transactionDate) {
    // Generate 4 random letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomLetters = '';
    for (let i = 0; i < 4; i++) {
      randomLetters += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    // Format the date as YYYYMMDD
    const year = transactionDate.getFullYear();
    const month = String(transactionDate.getMonth() + 1).padStart(2, '0');
    const day = String(transactionDate.getDate()).padStart(2, '0');
    const formattedDate = `${day}${month}${year}`;

    // Combine random letters and formatted date
    const uniqueCode = `${randomLetters}${formattedDate}`;
    return uniqueCode;
  };
  
  const put_transaction = async (req, res) => {
    try {
      const { transaction_uuid } = req.params;
      const { transaction_statustransaction, transaction_statuspayment, detailTransactions } = req.body;
  
      // Cari transaksi berdasarkan transaction_uuid saja
      const transaction = await tbl_transaction.findOne({
        where: {
          transaction_uuid: transaction_uuid,
        },
      });
  
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction tidak ditemukan",
          data: null,
        });
      }
  
      // Update status transaksi jika diberikan
      if (transaction_statustransaction !== undefined) {
        if (!['0', '1', '2'].includes(transaction_statustransaction)) {
          return res.status(400).json({
            success: false,
            message: "Status transaksi tidak valid.",
            data: null,
          });
        }
        await transaction.update({
          transaction_statustransaction: transaction_statustransaction,
        });
      }
  
      // Update status pembayaran jika diberikan
      if (transaction_statuspayment !== undefined) {
        if (!['0', '1', '2'].includes(transaction_statuspayment)) {
          return res.status(400).json({
            success: false,
            message: "Status pembayaran tidak valid.",
            data: null,
          });
        }
        await transaction.update({
          transaction_statuspayment: transaction_statuspayment,
        });
      }
  
      // Update detail transaksi jika detailTransactions diberikan
      if (detailTransactions && Array.isArray(detailTransactions)) {
        const updatedDetails = await Promise.all(detailTransactions.map(async (detail) => {
          if (detail.detailtransaction_uuid) {
            const detailTransaction = await tbl_detailtransaction.findOne({
              where: {
                detailtransaction_uuid: detail.detailtransaction_uuid,
                detailtransaction_transaction: transaction_uuid,
              },
            });
  
            if (!detailTransaction) {
              return null;
            }
  
            const updatedFields = {
              detailtransaction_status: detail.detailtransaction_status,
              detailtransaction_menu: detail.detailtransaction_menu,
              detailtransaction_qtymenu: detail.detailtransaction_qtymenu,
              detailtransaction_desc: detail.detailtransaction_desc,
              detailtransaction_packagemenu: detail.detailtransaction_packagemenu,
              detailtransaction_qtypackagemenu: detail.detailtransaction_qtypackagemenu,
              detailtransaction_menucomplete: detail.detailtransaction_status === '2' ? new Date() : null,
            };
  
            // Filter out fields with null or undefined values
            Object.keys(updatedFields).forEach(key => updatedFields[key] == null && delete updatedFields[key]);
  
            await detailTransaction.update(updatedFields);
  
            // Return the updated detailTransaction if successfully updated
            return detailTransaction;
          }
        }));
  
        const filteredUpdatedDetails = updatedDetails.filter(detail => detail !== null);
  
        const filteredDetailTransactions = filteredUpdatedDetails.map(dt => ({
          detailtransaction_uuid: dt.detailtransaction_uuid,
          detailtransaction_menu: dt.detailtransaction_menu,
          detailtransaction_qtymenu: dt.detailtransaction_qtymenu,
          detailtransaction_desc: dt.detailtransaction_desc,
          detailtransaction_dateorder: moment(dt.detailtransaction_dateorder).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss'),
          detailtransaction_status: dt.detailtransaction_status,
          detailtransaction_menucomplete: dt.detailtransaction_menucomplete ? moment(dt.detailtransaction_menucomplete).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss') : null,
          detailtransaction_packagemenu: dt.detailtransaction_packagemenu,
          detailtransaction_qtypackagemenu: dt.detailtransaction_qtypackagemenu,
        }));
  
        return res.status(200).json({
          success: true,
          message: "Berhasil merubah detail transaksi",
          data: {
            transaction: {
              transaction_uuid: transaction.transaction_uuid,
              transaction_statustransaction: transaction.transaction_statustransaction,
              transaction_statuspayment: transaction.transaction_statuspayment,
              transaction_customer: transaction.transaction_customer,
              transaction_total: transaction.transaction_total,
              transaction_date: moment(transaction.transaction_date).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss'),
            },
            detailTransactions: filteredDetailTransactions,
          },
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Berhasil merubah status transaksi",
        data: {
          transaction: {
            transaction_uuid: transaction.transaction_uuid,
            transaction_statustransaction: transaction.transaction_statustransaction,
            transaction_statuspayment: transaction.transaction_statuspayment,
            transaction_customer: transaction.transaction_customer,
            transaction_total: transaction.transaction_total,
            transaction_date: moment(transaction.transaction_date).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss'),
          },
        },
      });
    } catch (error) {
      console.error("Data Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        data: null,
      });
    }
  };

const delete_transaction = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { transaction_uuid } = value;

    const transaction = await tbl_transaction.findOne({
      where: { transaction_uuid },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan",
        data: null,
      });
    }

    // Hapus semua detail transaksi yang terkait
    await tbl_detailtransaction.destroy({
      where: { detailtransaction_transaction: transaction_uuid }
    });

    // Hapus transaksi
    await tbl_transaction.destroy({
      where: { transaction_uuid }
    });

    res.json({
      success: true,
      message: "Sukses menghapus data transaksi beserta detailnya",
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

const get_transactions_user = async (req, res) => {
  try {
    const userUuid = req.userUuid;
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
      order = { transaction_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      transaction_delete_at: null,
    };

    if (filter.transaction_customer) {
      const filtercustomers = Array.isArray(filter.transaction_customer)
        ? filter.transaction_customer
        : filter.transaction_customer.split(",");

      if (filtercustomers.length > 0) {
        whereClause.transaction_customer = {
          [Sequelize.Op.or]: filtercustomers.map((customer) => ({
            [Sequelize.Op.like]: `%${customer.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.transaction_customer");
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

      whereClause.transaction_customer = whereClause.transaction_customer
        ? { [Sequelize.Op.and]: [whereClause.transaction_customer, keywordClause] }
        : keywordClause;
    }

    // Menggunakan findAll dengan eager loading untuk mengambil transaksi-transaksi terkait
    const transactions = await tbl_transaction.findAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      where: {
        transaction_customer: userUuid,
      },
      attributes: ['transaction_uuid', 'transaction_date', 'transaction_total', 'transaction_statustransaction', 'transaction_statuspayment', 'transaction_code', 'transaction_customer', 'transaction_typepayment'],
      include: [
        {
          model: tbl_customer,
          as: 'transaction_customer_as',
          attributes: ['customer_uuid', 'customer_username'],
        },
        {
          model: tbl_typepayment,
          as: "transaction_typepayment_as",
          attributes: ["typepayment_uuid", "typepayment_name"],
        },
      ],
    });

    if (!transactions.length) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada transaksi ditemukan",
        data: null,
      });
    }

    // Array untuk menampung semua transaction_uuid dari hasil pencarian transactions
    const transactionUuids = transactions.map(transaction => transaction.transaction_uuid);

    // Mendapatkan detail transaksi berdasarkan transaction_uuid
    const detailTransactions = await tbl_detailtransaction.findAll({
      where: { detailtransaction_transaction: transactionUuids }, // Menggunakan array transactionUuids
      include: [
        {
          model: tbl_menu,
          as: "detailtransaction_menu_as",
          attributes: [
            'menu_uuid', 'menu_name', 'menu_statusavailable',
            'menu_description', 'menu_quantity', 'menu_price'
          ],
          include: [
            {
              model: tbl_typemenu,
              as: 'menu_typemenu_as',
              attributes: ['typemenu_uuid', 'typemenu_name'],
            }
          ]
        },
        {
          model: tbl_packagemenu,
          as: "detailtransaction_packagemenu_as",
          attributes: [
            'packagemenu_uuid', 'packagemenu_name',
            'packagemenu_description', 'packagemenu_price'
          ],
        },
      ]
    });

    // Menghitung total transaksi
    const transactionData = transactions.map(transaction => {
      let totalTransaction = 0;

      // Menghitung total transaksi hanya dari detail transaksi yang tidak null
      for (const detail of detailTransactions) {
        if (detail.detailtransaction_transaction === transaction.transaction_uuid) {
          if (detail.detailtransaction_menu_as) {
            const menuPrice = detail.detailtransaction_menu_as.menu_price || 0;
            const menuQuantity = detail.detailtransaction_qtymenu || 0;
            totalTransaction += menuPrice * menuQuantity;
          }

          if (detail.detailtransaction_packagemenu_as) {
            const packageMenuPrice = detail.detailtransaction_packagemenu_as.packagemenu_price || 0;
            const packageMenuQuantity = detail.detailtransaction_qtypackagemenu || 0;
            totalTransaction += packageMenuPrice * packageMenuQuantity;
          }
        }
      }

      // Membuat array respons untuk detail transaksi
      const detailTransactionData = detailTransactions.filter(detail => detail.detailtransaction_transaction === transaction.transaction_uuid).map(detail => ({
        detailtransaction_dateorder: moment(detail.detailtransaction_dateorder).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss'),
        detailtransaction_menu: detail.detailtransaction_menu_as ? {
          menu_uuid: detail.detailtransaction_menu_as.menu_uuid,
          menu_name: detail.detailtransaction_menu_as.menu_name,
          menu_statusavailable: detail.detailtransaction_menu_as.menu_statusavailable,
          menu_description: detail.detailtransaction_menu_as.menu_description,
          menu_quantity: detail.detailtransaction_qtymenu,
          menu_price: detail.detailtransaction_menu_as.menu_price,
          menu_typemenu: detail.detailtransaction_menu_as.menu_typemenu_as || null,
        } : null,
        detailtransaction_packagemenu: detail.detailtransaction_packagemenu_as ? {
          packagemenu_uuid: detail.detailtransaction_packagemenu_as.packagemenu_uuid,
          packagemenu_name: detail.detailtransaction_packagemenu_as.packagemenu_name,
          packagemenu_description: detail.detailtransaction_packagemenu_as.packagemenu_description,
          packagemenu_price: detail.detailtransaction_packagemenu_as.packagemenu_price,
        } : null,
        detailtransaction_qtymenu: detail.detailtransaction_qtymenu,
        detailtransaction_qtypackagemenu: detail.detailtransaction_qtypackagemenu,
        detailtransaction_desc: detail.detailtransaction_desc,
      }));

      return {
        transaction_uuid: transaction.transaction_uuid,
        transaction_date: moment(transaction.transaction_date).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss'),
        transaction_total: totalTransaction,
        transaction_code: transaction.transaction_code,
        transaction_statustransaction: transaction.transaction_statustransaction,
        transaction_statuspayment: transaction.transaction_statuspayment,
        transaction_customer: transaction.transaction_customer_as
          ? {
              customer_uuid: transaction.transaction_customer_as.customer_uuid,
              customer_username: transaction.transaction_customer_as.customer_username,
            }
          : null,
        transaction_typepayment: transaction.transaction_typepayment_as
          ? {
              typepayment_uuid: transaction.transaction_typepayment_as.typepayment_uuid,
              typepayment_name: transaction.transaction_typepayment_as.typepayment_name,
            }
          : null,
        detailTransactions: detailTransactionData,
      };
    });

    res.status(200).json({
      success: true,
      message: "Detail transaksi berhasil diambil.",
      data: transactionData,
    });

  } catch (error) {
    console.error('Data Error:', error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: null,
    });
  }
};

const get_detail_transaction = async (req, res) => {
  try {
    const userUuid = req.userUuid;
    const { transaction_uuid } = req.params;
    
    // Pastikan transaksi milik user yang login
    const transaction = await tbl_transaction.findOne({
      where: {
        transaction_customer: userUuid,
        transaction_uuid: transaction_uuid,
      },
      attributes: ['transaction_uuid', 'transaction_date', 'transaction_total', 'transaction_statustransaction', 'transaction_statuspayment', 'transaction_code', 'transaction_customer', 'transaction_typepayment'],
      include: [
        {
          model: tbl_customer,
          as: 'transaction_customer_as',
          attributes: ['customer_uuid','customer_username'],
        },
        {
          model: tbl_typepayment,
          as: "transaction_typepayment_as",
          attributes: ["typepayment_uuid","typepayment_name"],
        },
      ],
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan atau tidak milik pengguna",
        data: null,
      });
    }

    // Dapatkan detail transaksi berdasarkan UUID transaksi
    const detailTransactions = await tbl_detailtransaction.findAll({
      where: {
        detailtransaction_transaction: transaction_uuid,
      },
      attributes: ['detailtransaction_uuid', 'detailtransaction_menu', 'detailtransaction_qtymenu', 'detailtransaction_packagemenu', 'detailtransaction_qtypackagemenu', 'detailtransaction_desc', 'detailtransaction_dateorder'],
      include: [
        {
          model: tbl_menu,
          as: "detailtransaction_menu_as",
          attributes: [
            'menu_uuid', 'menu_name', 'menu_statusavailable', 
            'menu_description', 'menu_quantity', 'menu_price'
          ],
          include: [
            {
              model: tbl_typemenu,
              as: 'menu_typemenu_as',
              attributes: ['typemenu_uuid', 'typemenu_name'],
            }
          ]
        },
        {
          model: tbl_packagemenu,
          as: "detailtransaction_packagemenu_as",
          attributes: [
            'packagemenu_uuid', 'packagemenu_name', 
            'packagemenu_description', 'packagemenu_price'
          ],
        },
      ],
    });

    // Map the detail transactions without filtering out null values
    const detailTransactionsData = detailTransactions.map(detail => ({
      detailtransaction_uuid: detail.detailtransaction_uuid,
      detailtransaction_menu: detail.detailtransaction_menu_as ? {
        menu_uuid: detail.detailtransaction_menu_as.menu_uuid,
        menu_name: detail.detailtransaction_menu_as.menu_name,
        menu_statusavailable: detail.detailtransaction_menu_as.menu_statusavailable,
        menu_description: detail.detailtransaction_menu_as.menu_description,
        menu_quantity: detail.detailtransaction_qtymenu,
        menu_price: detail.detailtransaction_menu_as.menu_price,
        menu_typemenu: detail.detailtransaction_menu_as.menu_typemenu_as || null,
      } : null,
      detailtransaction_packagemenu: detail.detailtransaction_packagemenu_as ? {
        packagemenu_uuid: detail.detailtransaction_packagemenu_as.packagemenu_uuid,
        packagemenu_name: detail.detailtransaction_packagemenu_as.packagemenu_name,
        packagemenu_description: detail.detailtransaction_packagemenu_as.packagemenu_description,
        packagemenu_price: detail.detailtransaction_packagemenu_as.packagemenu_price,
        packagemenu_qtypackagemenu: detail.detailtransaction_qtypackagemenu,
      } : null,
      detailtransaction_qtymenu: detail.detailtransaction_qtymenu,
      detailtransaction_qtypackagemenu: detail.detailtransaction_qtypackagemenu,
      detailtransaction_desc: detail.detailtransaction_desc,
      detailtransaction_dateorder: moment(detail.detailtransaction_dateorder).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss'),
    }));

    const result = {
      success: true,
      message: "Berhasil mendapatkan detail transaksi",
      data: {
        transaction_uuid: transaction.transaction_uuid,
        transaction_date: moment(transaction.transaction_date).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss'),
        transaction_total: transaction.transaction_total,
        transaction_statustransaction: transaction.transaction_statustransaction,
        transaction_statuspayment: transaction.transaction_statuspayment,
        transaction_code: transaction.transaction_code,
        transaction_customer: transaction.transaction_customer_as
          ? {
              customer_uuid: transaction.transaction_customer_as.customer_uuid,
              customer_username: transaction.transaction_customer_as.customer_username,
            }
          : null,
        transaction_typepayment: transaction.transaction_typepayment_as
          ? {
              typepayment_uuid: transaction.transaction_typepayment_as.typepayment_uuid,
              typepayment_name: transaction.transaction_typepayment_as.typepayment_name,
            }
          : null,
        detailTransactions: detailTransactionsData,
      },
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('Data Error:', error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const get_all_transaction = async (req, res) => {
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
      order = { transaction_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      transaction_delete_at: null,
    };

    if (filter.transaction_customer) {
      const filtercustomers = Array.isArray(filter.transaction_customer)
        ? filter.transaction_customer
        : filter.transaction_customer.split(",");

      if (filtercustomers.length > 0) {
        whereClause.transaction_customer = {
          [Sequelize.Op.or]: filtercustomers.map((customer) => ({
            [Sequelize.Op.like]: `%${customer.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.transaction_customer");
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

      whereClause.transaction_customer = whereClause.transaction_customer
        ? { [Sequelize.Op.and]: [whereClause.transaction_customer, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_transaction.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
            model: tbl_typepayment,
            as: 'transaction_typepayment_as',
            attributes: ['typepayment_uuid', 'typepayment_name'],
        },
        {
          model: tbl_customer,
          as: 'transaction_customer_as',
          attributes: ['customer_uuid', 'customer_username'],
        }
    ]
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((transaction) => ({
        transaction_uuid: transaction.transaction_uuid,
        transaction_code: transaction.transaction_code,
        transaction_statustransaction: transaction.transaction_statustransaction,
        transaction_statuspayment: transaction.transaction_statuspayment,
        transaction_customer: transaction.transaction_customer_as
        ? {
          customer_uuid: transaction.transaction_customer_as.customer_uuid,
          customer_username: transaction.transaction_customer_as.customer_username,
        } : null,
        transaction_date: moment(transaction.transaction_date).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss'),
        transaction_total: transaction.transaction_total,
        transaction_statustransaction: transaction.transaction_statustransaction,
        transaction_typepayment: transaction.transaction_typepayment_as
        ? {
            typepayment_uuid: transaction.transaction_typepayment_as.typepayment_uuid,
            typepayment_name: transaction.transaction_typepayment_as.typepayment_name
        } : null,
        transaction_statuspayment: transaction.transaction_statuspayment,
      //   transaction_discount: transaction.transaction_discount_as
      //   ? {
      //     discount_uuid: transaction.transaction_discount_as.discount_uuid,
      //     discount_name: transaction.transaction_discount_as.discount_name,
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
    const excludePagesUrl = "http://localhost:5000/api/v1/transaction/get_all";

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

const get_uniqe_transaction = async (req, res) => {
  try {
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { field } = value;
    const fieldsArray = field.split(",");
    const tableAttributes = tbl_transaction.rawAttributes;
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
      const values = await tbl_transaction.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(f)), f]],
        where: {
          transaction_delete_at: null,
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

const get_count_transaction = async (req, res) => {
  try {
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { field } = value;

    const counts = {};

    for (const fieldcustomer in field) {
      if (field.hasOwnProperty(fieldcustomer)) {
        const values = Array.isArray(field[fieldcustomer])
          ? field[fieldcustomer]
          : field[fieldcustomer].split(",").map((val) => val.trim());

        const valueCounts = {};

        for (const value of values) {
          const count = await tbl_transaction.count({
            where: {
              [fieldcustomer]: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.eq]: value,
              },
              transaction_delete_at: null,
            },
          });
          valueCounts[value] = count;
        }

        counts[fieldcustomer] = Object.keys(valueCounts).map((value) => ({
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

const get_transaction_bytransaction_code = async (req, res) => {
  try {
    const { transaction_code } = req.params;

    // Memastikan transaction_code tersedia
    if (!transaction_code) {
      return res.status(400).json({
        success: false,
        message: "Transaction code tidak tersedia.",
        data: null,
      });
    }

    // Mencari transaksi berdasarkan transaction_code
    const transaction = await tbl_transaction.findOne({ 
      where: { transaction_code },
      include: [
        {
          model: tbl_customer,
          as: "transaction_customer_as",
          attributes: ["customer_uuid","customer_username"],
        },
        {
          model: tbl_typepayment,
          as: "transaction_typepayment_as",
          attributes: ["typepayment_uuid","typepayment_name"],
        },
      ],
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan.",
        data: null,
      });
    }

    // Mendapatkan detail transaksi berdasarkan transaction_uuid
    const detailTransactions = await tbl_detailtransaction.findAll({ 
      where: { detailtransaction_transaction: transaction.transaction_uuid },
      include: [
        {
          model: tbl_menu,
          as: "detailtransaction_menu_as",
          attributes: [
            'menu_uuid', 'menu_name', 'menu_statusavailable', 
            'menu_description', 'menu_quantity', 'menu_price'
          ],
          include: [
            {
              model: tbl_typemenu,
              as: 'menu_typemenu_as',
              attributes: ['typemenu_uuid', 'typemenu_name'],
            }
          ]
        },
        {
          model: tbl_packagemenu,
          as: "detailtransaction_packagemenu_as",
          attributes: [
            'packagemenu_uuid', 'packagemenu_name', 
            'packagemenu_description', 'packagemenu_price'
          ],
        },
      ]
    });

    // Menghitung total transaksi
    let totalTransaction = 0;

    // Menghitung total transaksi dari semua detail transaksi
    for (const detail of detailTransactions) {
      if (detail.detailtransaction_menu_as) {
        const menuPrice = detail.detailtransaction_menu_as.menu_price || 0;
        const menuQuantity = detail.detailtransaction_qtymenu || 0;
        totalTransaction += menuPrice * menuQuantity;
      }

      if (detail.detailtransaction_packagemenu_as) {
        const packageMenuPrice = detail.detailtransaction_packagemenu_as.packagemenu_price || 0;
        const packageMenuQuantity = detail.detailtransaction_qtypackagemenu || 0;
        totalTransaction += packageMenuPrice * packageMenuQuantity;
      }
    }

    // Membuat array respons untuk detail transaksi
    const detailTransactionData = detailTransactions.map(detail => ({
      detailtransaction_dateorder: moment(detail.detailtransaction_dateorder).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss'),
      detailtransaction_menu: detail.detailtransaction_menu_as ? {
        menu_uuid: detail.detailtransaction_menu_as.menu_uuid,
        menu_name: detail.detailtransaction_menu_as.menu_name,
        menu_statusavailable: detail.detailtransaction_menu_as.menu_statusavailable,
        menu_description: detail.detailtransaction_menu_as.menu_description,
        menu_quantity: detail.detailtransaction_qtymenu,
        menu_price: detail.detailtransaction_menu_as.menu_price,
        menu_typemenu: detail.detailtransaction_menu_as.menu_typemenu_as || null,
      } : null,
      detailtransaction_packagemenu: detail.detailtransaction_packagemenu_as ? {
        packagemenu_uuid: detail.detailtransaction_packagemenu_as.packagemenu_uuid,
        packagemenu_name: detail.detailtransaction_packagemenu_as.packagemenu_name,
        packagemenu_description: detail.detailtransaction_packagemenu_as.packagemenu_description,
        packagemenu_price: detail.detailtransaction_packagemenu_as.packagemenu_price,
      } : null,
      detailtransaction_qtymenu: detail.detailtransaction_qtymenu,
      detailtransaction_qtypackagemenu: detail.detailtransaction_qtypackagemenu,
      detailtransaction_desc: detail.detailtransaction_desc,
    }));

    res.status(200).json({
      success: true,
      message: "Detail transaksi berhasil diambil.",
      data: {
        transaction: {
          transaction_uuid: transaction.transaction_uuid,
          transaction_total: totalTransaction,
          transaction_code: transaction.transaction_code,
          transaction_customer: transaction.transaction_customer_as
          ?{
            customer_uuid : transaction.transaction_customer_as.customer_uuid,
            customer_username: transaction.transaction_customer_as.customer_username,
          }: null,
          transaction_date: moment(transaction.transaction_date).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss'),
          transaction_typepayment: transaction.transaction_typepayment_as
          ?{
            typepayment_uuid: transaction.transaction_typepayment_as.typepayment_uuid,
            typepayment_name: transaction.transaction_typepayment_as.typepayment_name,
          }: null,
        },
        detailTransactions: detailTransactionData,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: null,
    });
  }
};



module.exports = {
  post_transaction,
  put_transaction,
  delete_transaction,
  get_transactions_user,
  get_detail_transaction,
  get_all_transaction,
  get_uniqe_transaction,
  get_count_transaction,
  get_transaction_bytransaction_code,
};