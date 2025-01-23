const router = require('express').Router();
const {
    Login,
    logOut,
    Me,
    getPersonalData,
    registrasi_customer,
    resetPassword,

} = require('../controllers/c_auth');
const { authToken, authenticate } = require('../middleware/authMiddleware');

// Rute untuk mendapatkan informasi pengguna yang sedang login
router.get('/me', Me);
router.get('/personal_data', authenticate, getPersonalData);

// Rute untuk login
router.post('/login', Login);

// Rute untuk registrasi pengguna baru (customer)
router.post('/registrasi', registrasi_customer);

// Rute untuk logout
router.delete('/logout', logOut);

// Rute untuk lupa password
router.put('/resetPassword', authenticate, resetPassword);

module.exports = router;
