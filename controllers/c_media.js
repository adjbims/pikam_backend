const db = require("../models");
const tbl_media = db.tbl_media;
const tbl_menu = db.tbl_menu;
const tbl_user = db.tbl_user;
const tbl_customer = db.tbl_customer;
const tbl_packagemenu = db.tbl_packagemenu;
const tbl_typemenu = db.tbl_typemenu;
const Sequelize = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");
const Joi = require("joi");
const fs = require("fs");
require("dotenv").config();

const uuidSchema = Joi.object({
    table_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
});

const uuidSchemaMedia = Joi.object({
    media_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
});

// Konfigurasi penyimpanan disk
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = "./uploads/img"; // Semua file gambar disimpan di folder 'img'
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

// Fungsi filter untuk memvalidasi jenis file
const fileFilter = (req, file, cb) => {
    // Memeriksa apakah file adalah gambar dengan ekstensi yang valid
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/png"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Format file tidak didukung"), false);
    }
};

// Inisialisasi multer dengan konfigurasi penyimpanan dan filter
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 300 * 1024 * 1024 }, // Batas ukuran file 300MB
});

// Fungsi untuk menangani upload file
const post_upload_media = async (req, res) => {
    upload.single("file")(req, res, async (error) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }

        if (!req.file) {
            return res.status(400).send("File tidak ditemukan.");
        }

        try {
            const userUuid = req.userUuid; // Mengambil informasi pengguna dari request

            console.log("User UUID dari req:", userUuid); // Tambahkan log ini untuk debugging

            if (!userUuid) {
                // Memastikan userUuid tersedia
                return res.status(401).json({
                    success: false,
                    message: "Pengguna tidak terautentikasi.",
                    data: null,
                });
            }

            const { value, error: validationError } = uuidSchema.validate(
                req.params
            );
            if (validationError) {
                return res
                    .status(400)
                    .json({ message: validationError.message });
            }

            const { table_uuid } = value;

            const file = req.file;
            const extensi = path.extname(file.originalname);
            const size = file.size;
            const url = `/uploads/img/${file.filename}`; // Menyimpan URL relatif
            const media_uuid = uuidv4();

            let entityType = null;

            // Periksa UUID di setiap tabel dan pastikan hanya satu tabel yang terpengaruh
            const [
                menuExists,
                userExists,
                customerExists,
                packagemenuExists,
                typemenuExists,
            ] = await Promise.all([
                tbl_menu.findOne({ where: { menu_uuid: table_uuid } }),
                tbl_user.findOne({ where: { user_uuid: table_uuid } }),
                tbl_customer.findOne({ where: { customer_uuid: table_uuid } }),
                tbl_packagemenu.findOne({
                    where: { packagemenu_uuid: table_uuid },
                }),
                tbl_typemenu.findOne({ where: { typemenu_uuid: table_uuid } }),
            ]);

            if (menuExists) {
                entityType = "menu";
            } else if (userExists) {
                entityType = "user";
            } else if (customerExists) {
                entityType = "customer";
            } else if (packagemenuExists) {
                entityType = "packagemenu";
            } else if (typemenuExists) {
                entityType = "typemenu";
            } else {
                return res
                    .status(404)
                    .send("UUID tidak ditemukan dalam entitas mana pun.");
            }

            // Periksa apakah sudah ada media terkait dengan UUID
            const existingMedia = await tbl_media.findOne({
                where: {
                    media_uuid_table: table_uuid,
                    media_table: entityType,
                    media_category: "img",
                },
            });

            // Jika ada media yang ada, hapus media tersebut
            if (existingMedia) {
                const filePath = `./uploads/${existingMedia.media_category}/${existingMedia.media_hash_name}`;
                fs.unlink(filePath, (error) => {
                    if (error) {
                        console.error("Gagal menghapus file lama:", error);
                    } else {
                        console.log("File lama berhasil dihapus");
                    }
                });

                await tbl_media.destroy({
                    where: {
                        media_uuid_table: table_uuid,
                    },
                });
            }

            // Membuat objek media baru
            const newMedia = await tbl_media.create({
                media_uuid: media_uuid,
                media_uuid_table: table_uuid,
                media_table: entityType,
                media_name: file.originalname,
                media_hash_name: file.filename,
                media_category: "img", // Semua file gambar dikategorikan sebagai 'img'
                media_extensi: extensi.slice(1),
                media_size: size.toString(),
                media_url: url, // Menyimpan URL relatif
                media_metadata: JSON.stringify({
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                }),
            });

            // Perbarui kolom gambar terkait dalam tabel yang sesuai
            if (entityType === "menu") {
                await tbl_menu.update(
                    { menu_image: url },
                    { where: { menu_uuid: table_uuid } }
                );
            } else if (entityType === "user") {
                await tbl_user.update(
                    { user_media: url },
                    { where: { user_uuid: table_uuid } }
                );
            } else if (entityType === "customer") {
                await tbl_customer.update(
                    { customer_media: url },
                    { where: { customer_uuid: table_uuid } }
                );
            } else if (entityType === "packagemenu") {
                await tbl_packagemenu.update(
                    { packagemenu_image: url },
                    { where: { packagemenu_uuid: table_uuid } }
                );
            } else if (entityType === "typemenu") {
                await tbl_typemenu.update(
                    { typemenu_image: url },
                    { where: { typemenu_uuid: table_uuid } }
                );
            }

            const baseUrl = process.env.MEDIA_URL; // Ambil MEDIA_URL dari .env

            res.status(200).json({
                message: "File berhasil diupload",
                data: {
                    ...newMedia.toJSON(),
                    media_url: `${baseUrl}${newMedia.media_url}`, // Menambahkan BASE_URL pada saat response
                },
                success: true,
            });
        } catch (dbError) {
            console.error("Database Error:", dbError);
            res.status(500).json({ message: dbError.message });
        }
    });
};

const delete_media = async (req, res) => {
    try {
        const { error, value } = uuidSchemaMedia.validate(req.params);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                data: null,
            });
        }

        const { media_uuid } = value;

        const delete_media = await tbl_media.findOne({
            where: {
                media_uuid,
            },
        });

        if (!delete_media) {
            return res.status(400).json({
                success: false,
                message: "Gagal menghapus data",
                data: null,
            });
        }

        const deleteMedia = await tbl_media.findAll({
            where: {
                media_uuid,
            },
        });

        for (const media of deleteMedia) {
            const filePath = `./uploads/${media.media_category}/${media.media_hash_name}`;
            fs.unlink(filePath, (error) => {
                if (error) {
                    console.error("File gagal di hapus:", error);
                } else {
                    console.log("Sukses menambahkan data");
                }
            });
        }

        await delete_media.update({ media_delete_at: new Date() });

        res.status(200).json({
            success: true,
            message: "Sukses Menghapus Data",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null,
        });
    }
};

const get_all_media = async (req, res) => {
    try {
        const {
            limit = null,
            page = null,
            keyword = "",
            filter = {},
            order = { media_id: "desc" },
        } = req.query;

        let offset = limit && page ? (page - 1) * limit : 0;
        const orderField = Object.keys(order)[0];
        const orderDirection =
            order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

        const whereClause = {
            media_delete_at: null,
        };

        if (filter.media_table) {
            const filterNames = Array.isArray(filter.media_table)
                ? filter.media_table
                : filter.media_table.split(",");

            if (filterNames.length > 0) {
                whereClause.media_table = {
                    [Sequelize.Op.or]: filterNames.map((name) => ({
                        [Sequelize.Op.like]: `%${name.trim()}%`,
                    })),
                    [Sequelize.Op.not]: null,
                };
            } else {
                console.log("Empty filter.media_table");
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

            whereClause.media_table = whereClause.media_table
                ? {
                      [Sequelize.Op.and]: [
                          whereClause.media_table,
                          keywordClause,
                      ],
                  }
                : keywordClause;
        }

        const data = await tbl_media.findAndCountAll({
            where: whereClause,
            order: [[orderField, orderDirection]],
            limit: limit ? parseInt(limit) : null,
            offset: offset ? parseInt(offset) : null,
        });

        const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

        const result = {
            success: true,
            message: "Sukses mendapatkan data",
            data: data.rows.map((media) => ({
                media_uuid: media.media_uuid,
                media_uuid_table: media.media_uuid_table,
                media_table: media.media_table,
                media_name: media.media_name,
                media_hash_name: media.media_hash_name,
                media_category: media.media_category,
                media_extensi: media.media_extensi,
                media_size: media.media_size,
                media_url: media.media_url,
                media_metadata: media.media_metadata,
            })),
            pages: {
                total: data.count,
                per_page: limit || data.count,
                next_page:
                    limit && page
                        ? page < totalPages
                            ? page + 1
                            : null
                        : null,
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

        const currentUrl = `${req.protocol}://${req.get("host")}${
            req.originalUrl
        }`;
        const excludePagesUrl = "http://localhost:9900/api/v1/media/get_all";

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

const get_detail_media = async (req, res) => {
    try {
        const { value } = uuidSchema.validate(req.params);
        const { table_uuid } = value;
        const {
            limit = null,
            page = null,
            keyword = "",
            filter = {},
            order = { media_id: "desc" },
        } = req.query;

        let offset = limit && page ? (page - 1) * limit : 0;
        const orderField = Object.keys(order)[0];
        const orderDirection =
            order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

        const whereClause = {
            media_uuid_table: table_uuid,
            media_delete_at: null,
        };

        if (filter.media_table) {
            const filterNames = Array.isArray(filter.media_table)
                ? filter.media_table
                : filter.media_table.split(",");

            if (filterNames.length > 0) {
                whereClause.media_table = {
                    [Sequelize.Op.or]: filterNames.map((name) => ({
                        [Sequelize.Op.like]: `%${name.trim()}%`,
                    })),
                    [Sequelize.Op.not]: null,
                };
            } else {
                console.log("Empty filter.media_table");
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

            whereClause.media_table = whereClause.media_table
                ? {
                      [Sequelize.Op.and]: [
                          whereClause.media_table,
                          keywordClause,
                      ],
                  }
                : keywordClause;
        }

        const data = await tbl_media.findAndCountAll({
            where: whereClause,
            order: [[orderField, orderDirection]],
            limit: limit ? parseInt(limit) : null,
            offset: offset ? parseInt(offset) : null,
        });

        const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

        const result = {
            success: true,
            message: "Sukses mendapatkan data",
            data: data.rows.map((media) => ({
                media_uuid: media.media_uuid,
                media_uuid_table: media.media_uuid_table,
                media_table: media.media_table,
                media_name: media.media_name,
                media_hash_name: media.media_hash_name,
                media_category: media.media_category,
                media_extensi: media.media_extensi,
                media_size: media.media_size,
                media_url: media.media_url,
                media_metadata: media.media_metadata,
            })),
            pages: {
                total: data.count,
                per_page: limit || data.count,
                next_page:
                    limit && page
                        ? page < totalPages
                            ? page + 1
                            : null
                        : null,
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

        const currentUrl = `${req.protocol}://${req.get("host")}${
            req.originalUrl
        }`;
        const excludePagesUrl = "http://localhost:9900/api/v1/media/get_all";

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

const get_detail_mediabymediauuid = async (req, res) => {
    try {
        const { value } = uuidSchemaMedia.validate(req.params);
        const { media_uuid } = value;
        const {
            limit = null,
            page = null,
            keyword = "",
            filter = {},
            order = { media_id: "desc" },
        } = req.query;

        let offset = limit && page ? (page - 1) * limit : 0;
        const orderField = Object.keys(order)[0];
        const orderDirection =
            order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

        const whereClause = {
            media_uuid: media_uuid,
            media_delete_at: null,
        };

        if (filter.media_table) {
            const filterNames = Array.isArray(filter.media_table)
                ? filter.media_table
                : filter.media_table.split(",");

            if (filterNames.length > 0) {
                whereClause.media_table = {
                    [Sequelize.Op.or]: filterNames.map((name) => ({
                        [Sequelize.Op.like]: `%${name.trim()}%`,
                    })),
                    [Sequelize.Op.not]: null,
                };
            } else {
                console.log("Empty filter.media_table");
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

            whereClause.media_table = whereClause.media_table
                ? {
                      [Sequelize.Op.and]: [
                          whereClause.media_table,
                          keywordClause,
                      ],
                  }
                : keywordClause;
        }

        const data = await tbl_media.findAndCountAll({
            where: whereClause,
            order: [[orderField, orderDirection]],
            limit: limit ? parseInt(limit) : null,
            offset: offset ? parseInt(offset) : null,
        });

        const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

        const result = {
            success: true,
            message: "Sukses mendapatkan data",
            data: data.rows.map((media) => ({
                media_uuid: media.media_uuid,
                media_uuid_table: media.media_uuid_table,
                media_table: media.media_table,
                media_name: media.media_name,
                media_hash_name: media.media_hash_name,
                media_category: media.media_category,
                media_extensi: media.media_extensi,
                media_size: media.media_size,
                media_url: media.media_url,
                media_metadata: media.media_metadata,
            })),
            pages: {
                total: data.count,
                per_page: limit || data.count,
                next_page:
                    limit && page
                        ? page < totalPages
                            ? page + 1
                            : null
                        : null,
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

        const currentUrl = `${req.protocol}://${req.get("host")}${
            req.originalUrl
        }`;
        const excludePagesUrl = "http://localhost:5000/api/v1/media/get_all";

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

module.exports = {
    get_all_media,
    post_upload_media,
    // post_media_business,
    delete_media,
    //   post_upload_media_any,
    get_detail_media,
    get_detail_mediabymediauuid,
};
