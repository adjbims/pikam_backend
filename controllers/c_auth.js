const db = require("../models");
const tbl_user = db.tbl_user;
const tbl_customer = db.tbl_customer;
const tbl_levels = db.tbl_levels;
const tbl_media = db.tbl_media;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const saltRounds = 10;

const customerSchema = Joi.object({
  customer_username: Joi.string().required(),
  customer_full_name: Joi.string().required(),
  customer_email: Joi.string().email().required(),
  customer_password: Joi.string().min(8).required(),
});

const Login = async (req, res) => {
  let uuid;
  let name;
  let email;
  let token;
  let password;

  try {
    const user_customer = await tbl_customer.findOne({
      where: {
        customer_email: req.body.email,
      },
    });

    const user_admin = await tbl_user.findOne({
      where: {
        user_email: req.body.email,
      },
    });

    const user_superadmin = await tbl_user.findOne({
      where: {
        user_email: req.body.email,
      },
    });

    const user_karyawandapur = await tbl_user.findOne({
      where: {
        user_email: req.body.email,
      },
    });

    const user_karyawankasir = await tbl_user.findOne({
      where: {
        user_email: req.body.email,
      },
    });

    if (
      !user_customer &&
      !user_admin &&
      !user_superadmin &&
      !user_karyawandapur &&
      !user_karyawankasir
    ) {
      return res.status(404).json({ msg: "Akun Anda tidak terdaftar!" });
    }

    if (user_customer) {
      const match = await bcrypt.compare(
        req.body.password,
        user_customer.customer_password
      );
      if (!match) {
        return res.status(400).json({ msg: "Password User Anda salah" });
      }
      name = user_customer.customer_username;
      email = user_customer.customer_email;
      uuid = user_customer.customer_uuid;
      password = user_customer.customer_password;
    }

    if (user_admin) {
      const match = await bcrypt.compare(
        req.body.password,
        user_admin.user_password
      );
      if (!match) {
        return res.status(400).json({ msg: "Password User Anda salah" });
      }
      name = user_admin.user_username;
      email = user_admin.user_email;
      uuid = user_admin.user_uuid;
      password = user_admin.user_password;
      // Membuat token
      token = jwt.sign(
        {
          uuid,
          email,
          password,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE_IN }
      );
      // Menyimpan token ke dalam kolom user_token di database
      await tbl_user.update({ user_token: token }, { where: { user_uuid: uuid } });
    }

    if (user_superadmin) {
      const match = await bcrypt.compare(
        req.body.password,
        user_superadmin.user_password
      );
      if (!match) {
        return res.status(400).json({ msg: "Password User Anda salah" });
      }
      name = user_superadmin.user_username;
      email = user_superadmin.user_email;
      uuid = user_superadmin.user_uuid;
      password = user_superadmin.user_password;
    }

    if (user_karyawandapur) {
      const match = await bcrypt.compare(
        req.body.password,
        user_karyawandapur.user_password
      );
      if (!match) {
        return res.status(400).json({ msg: "Password User Anda salah" });
      }
      name = user_karyawandapur.user_username;
      email = user_karyawandapur.user_email;
      uuid = user_karyawandapur.user_uuid;
      password = user_karyawandapur.user_password;
    }

    if (user_karyawankasir) {
      const match = await bcrypt.compare(
        req.body.password,
        user_karyawankasir.user_password
      );
      if (!match) {
        return res.status(400).json({ msg: "Password User Anda salah" });
      }
      name = user_karyawankasir.user_username;
      email = user_karyawankasir.user_email;
      uuid = user_karyawankasir.user_uuid;
      password = user_karyawankasir.user_password;
    }

    // Menghasilkan token untuk pengguna yang berhasil login (misal: superadmin, karyawandapur, karyawankasir)
    token = jwt.sign(
      {
        uuid,
        email,
        password,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE_IN }
    );

    // Set cookie
    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({ name, email, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

// Tidak Berjalan
const Me = async (req, res) => {
  let uuid;
  let name;
  let level;

  const tokenGuest = req.cookies.token_guest;
  const tokenAdmin = req.cookies.token_admin;
  const tokenDapur = req.cookies.token_dapur;
  const tokenKasir = req.cookies.token_kasir;
  const token = tokenGuest || tokenAdmin || tokenDapur || tokenKasir;
  
  if (!token) {
    return res
      .status(401)
      .json({ msg: "Tidak ada token JWT yang ditemukan di cookie!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    uuid = decoded.uuid;

    const user_customer = await tbl_customer.findOne({
      attributes: ["customer_uuid", "customer_username"],
      where: {
        customer_uuid: uuid,
      },
    });

    const user_admin = await tbl_user.findOne({
      attributes: ["user_uuid", "user_username"],
      where: {
        user_uuid: uuid,
      },
    });

    const user_superadmin = await tbl_user.findOne({
      attributes: ["user_uuid", "user_username"],
      where: {
        user_uuid: uuid,
      },
    });

    const user_karyawandapur = await tbl_user.findOne({
      attributes: ["user_uuid", "user_username"],
      where: {
        user_uuid: uuid,
      },
    });

    const user_karyawankasir = await tbl_user.findOne({
      attributes: ["user_uuid", "user_username"],
      where: {
        user_uuid: uuid,
      },
    });

    if (
      !user_customer &&
      !user_admin &&
      !user_superadmin &&
      !user_karyawandapur &&
      !user_karyawankasir
    ) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    } else if (user_admin) {
      name = user_admin["user_username"];
      level = "admin";
    } else if (user_customer) {
      name = user_customer["customer_username"];
      level = "customer";
    } else if (user_superadmin) {
      name = user_superadmin["user_username"];
      level = "super admin";
    } else if (user_karyawandapur) {
      name = user_karyawandapur["user_username"];
      level = "karyawan dapur";
    } else if (user_karyawankasir) {
      name = user_karyawankasir["user_username"];
      level = "karyawan kasir";
    }

    res.status(200).json({ uuid, name, level });
  } catch (error) {
    console.error(error);
    res.clearCookie("token_guest");
    res.clearCookie("token_admin");
    res.clearCookie("token_dapur");
    res.clearCookie("token_kasir");
    res.status(500).json({ msg: "Terjadi kesalahan pada server", error });
  }
};

const getPersonalData = async (req, res) => {
  let uuid;
  let name;
  let level;

  console.log('REQQQ', req.cookies)

  // const tokenGuest = req.cookies.token_guest;
  // const tokenAdmin = req.cookies.token_admin;
  // const tokenDapur = req.cookies.token_dapur;
  // const tokenKasir = req.cookies.token_kasir;
  const token = req.cookies.token;

  console.log('TOKENNauthhhhhhh', token)
  
  if (!token) {
    return res
      .status(401)
      .json({ msg: "Tidak ada token JWT yang ditemukan di cookie!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    uuid = decoded.uuid;

    const user_customer = await tbl_customer.findOne({
      attributes: ["customer_uuid", "customer_username"],
      where: {
        customer_uuid: uuid,
      },
    });

    const user_admin = await tbl_user.findOne({
      attributes: ["user_uuid", "user_username"],
      where: {
        user_uuid: uuid,
      },
    });

    const user_superadmin = await tbl_user.findOne({
      attributes: ["user_uuid", "user_username"],
      where: {
        user_uuid: uuid,
      },
    });

    const user_karyawandapur = await tbl_user.findOne({
      attributes: ["user_uuid", "user_username"],
      where: {
        user_uuid: uuid,
      },
    });

    const user_karyawankasir = await tbl_user.findOne({
      attributes: ["user_uuid", "user_username"],
      where: {
        user_uuid: uuid,
      },
    });

    if (
      !user_customer &&
      !user_admin &&
      !user_superadmin &&
      !user_karyawandapur &&
      !user_karyawankasir
    ) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    } else if (user_admin) {
      name = user_admin["user_username"];
      level = "admin";
    } else if (user_customer) {
      name = user_customer["customer_username"];
      level = "customer";
    } else if (user_superadmin) {
      name = user_superadmin["user_username"];
      level = "super admin";
    } else if (user_karyawandapur) {
      name = user_karyawandapur["user_username"];
      level = "karyawan dapur";
    } else if (user_karyawankasir) {
      name = user_karyawankasir["user_username"];
      level = "karyawan kasir";
    }

    res.status(200).json({ uuid, name, level });
  } catch (error) {
    console.error(error);
    res.clearCookie("token_guest");
    res.clearCookie("token_admin");
    res.clearCookie("token_dapur");
    res.clearCookie("token_kasir");
    res.status(500).json({ msg: "Terjadi kesalahan pada server", error });
  }
};

const registrasi_customer = async (req, res) => {
  try {
    const { error, value } = customerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      customer_username,
      customer_full_name,
      customer_email,
      customer_password,
    } = value;

    const existingCustomer = await tbl_customer.findOne({
      where: {
        [Op.and]: [
          { customer_email: customer_email },
          { customer_delete_at: null },
        ],
      },
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Email sudah digunakan, silakan gunakan email lain.",
        data: existingCustomer,
      });
    }

    const customer_uuid = uuidv4();

    const hashedPassword = await bcrypt.hash(customer_password, saltRounds);

    const level = await tbl_levels.findOne({
      where: { level_name: "customer" },
    });

    if (!level) {
      return res.status(404).json({
        success: false,
        message: "Level customer tidak ditemukan",
        data: null,
      });
    }

    const customerLevelUuid = level.level_uuid;

    const create_customer = await tbl_customer.create({
      customer_uuid: customer_uuid,
      customer_username: customer_username,
      customer_full_name: customer_full_name,
      customer_email: customer_email,
      customer_password: hashedPassword,
      customer_level: customerLevelUuid,
    });

    if (!create_customer) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data pelanggan",
        data: null,
      });
    }

    const create_media = await tbl_media.create({
      media_uuid_table: create_customer.customer_uuid,
      media_table: "customer",
    });

    if (!create_media) {
      return res.status(404).json({
        success: false,
        message: "Anda Gagal melakukan registrasi",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Registrasi Berhasil",
      data: {
        customer_uuid: create_customer.customer_uuid,
        customer_username: create_customer.customer_username,
        customer_address: create_customer.customer_address,
        customer_email: create_customer.customer_email,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const logOut = async (req, res) => {
  try {
    // Ambil token dari body atau query parameter, sesuaikan dengan kebutuhan
    const token = req.body.token || req.query.token || req.cookies.token_guest || req.cookies.token_admin;

    // Pastikan token dikirim
    if (!token) {
      return res.status(400).json({ msg: "Token tidak ada" });
    }

    // Temukan pengguna terkait dengan token yang diterima
    const user = await tbl_user.findOne({ where: { user_token: token } });

    // Jika pengguna ditemukan, hapus token dari database
    if (user) {
      await tbl_user.update({ user_token: null }, { where: { user_uuid: user.user_uuid } });
      res.clearCookie("token_guest");
      res.clearCookie("token_admin");
      return res.status(200).json({ msg: "Anda telah berhasil logout" });
    } else {
      return res.status(400).json({ msg: "Token tidak valid atau pengguna tidak ditemukan" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userUuid = req.userUuid; // Mengambil UUID pengguna dari token autentikasi

    // Log untuk memastikan userUuid diambil dengan benar
    console.log('User UUID dari req:', userUuid);

    if (!userUuid) {
      return res.status(401).json({
        success: false,
        message: "Pengguna tidak terautentikasi.",
        data: null,
      });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Password lama dan password baru harus diisi.",
        data: null,
      });
    }

    // Cari entitas pengguna berdasarkan UUID
    const user = await tbl_user.findOne({ where: { user_uuid: userUuid } });
    const customer = await tbl_customer.findOne({ where: { customer_uuid: userUuid } });

    // Jika pengguna tidak ditemukan, kembalikan respons 404
    if (!user && !customer) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
        data: null,
      });
    }

    // Periksa apakah password lama sesuai
    const isMatch = await bcrypt.compare(oldPassword, user ? user.user_password : customer.customer_password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Password lama tidak sesuai",
        data: null,
      });
    }

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password di database
    if (user) {
      await tbl_user.update(
        { user_password: hashedNewPassword },
        { where: { user_uuid: userUuid } }
      );
    } else {
      await tbl_customer.update(
        { customer_password: hashedNewPassword },
        { where: { customer_uuid: userUuid } }
      );
    }

    // Kirim respon berhasil
    return res.status(200).json({
      success: true,
      message: "Password telah berhasil diubah",
      data: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      data: null,
    });
  }
};

module.exports = { Login, registrasi_customer, logOut, Me, getPersonalData, resetPassword };
