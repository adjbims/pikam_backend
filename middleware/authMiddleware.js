const db = require("../models");
const tbl_levels = db.tbl_levels;
const tbl_user = db.tbl_user;
const tbl_customer = db.tbl_customer;
const tbl_access = db.tbl_access;
const tbl_modules = db.tbl_modules;
const tbl_permissions = db.tbl_permissions;
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        console.log('No token provided');
        return res.status(401).json({ msg: "Mohon login ke akun Anda!" });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        console.log('No token found after Bearer');
        return res.status(401).json({ msg: "Token tidak valid!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.uuid) {
            console.log('UUID not found in decoded token');
            return res.status(400).json({ msg: "Token tidak valid!" });
        }

        const uuid = decoded.uuid;

        const user = await tbl_customer.findOne({ where: { customer_uuid: uuid } });
        const user_admin = await tbl_user.findOne({ where: { user_uuid: uuid } });

        if (!user && !user_admin) {
            console.log('User not found');
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        req.userUuid = uuid;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ msg: "Token tidak valid atau telah kadaluarsa" });
    }
};

const superAdminAndAdmin = async (req, res, next) => {
    const uuid = req.userUuid;

    try {
        const leveladmin = await tbl_levels.findOne({ where: { level_name: 'admin' } });
        const levelsuperadmin = await tbl_levels.findOne({ where: { level_name: 'super admin' } });

        const user = await tbl_user.findOne({
            where: {
                [Op.or]: [
                    { user_level: leveladmin.dataValues.level_uuid },
                    { user_level: levelsuperadmin.dataValues.level_uuid, user_uuid: uuid }
                ]
            }
        });

        if (!user) {
            return res.status(403).json({ msg: "Akses ditolak!" });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};

const superAdminOnly = async (req, res, next) => {
    const uuid = req.userUuid;

    try {
        const levelsuperadmin = await tbl_levels.findOne({ where: { level_name: 'super admin' } });

        const user = await tbl_user.findOne({ where: { user_uuid: uuid, user_level: levelsuperadmin.dataValues.level_uuid } });

        if (!user) {
            return res.status(403).json({ msg: "Hak akses hanya super admin!" });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};

const authToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token anda tidak ditemukan' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Token salah atau kadaluarsa' });
        }
        req.user = {
            uuid: user.user_uuid,
            email: user.user_email,
            // Jangan simpan password di req.user
        };
        console.log("USERRRRR", req.user);
        next();
    });
};

module.exports = {
    authenticate,
    superAdminAndAdmin,
    superAdminOnly,
    authToken
};