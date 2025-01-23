const express = require('express');
const router = express.Router();
const { authenticate, superAdminAndAdmin, superAdminOnly } = require('../middleware/authMiddleware');
const { cekAccessControl } = require('../middleware/accessControlMiddleware');

const {
    post_typemenu,
    put_typemenu,
    delete_typemenu,
    get_detail_typemenu,
    get_all_typemenu,
    get_uniqe_typemenu,
    get_count_typemenu,
} = require('../controllers/c_typemenu');

// Routes for typemenu management
router.post('/typemenu', post_typemenu);
router.put('/typemenu/:typemenu_uuid', put_typemenu);
router.delete('/typemenu/:typemenu_uuid', delete_typemenu);
router.get('/typemenu/:typemenu_uuid', get_detail_typemenu);
router.get('/typemenu', get_all_typemenu);
router.get('/typemenu/unique', get_uniqe_typemenu);
router.get('/typemenu/count', get_count_typemenu);

module.exports = router;
