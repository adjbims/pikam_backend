const express = require('express');
const router = express.Router();
const { authenticate, superAdminAndAdmin, superAdminOnly } = require('../middleware/authMiddleware');
const { cekAccessControl } = require('../middleware/accessControlMiddleware');

const {
    post_typepayment,
    put_typepayment,
    delete_typepayment,
    get_detail_typepayment,
    get_all_typepayment,
    get_uniqe_typepayment,
    get_count_typepayment,
} = require('../controllers/c_typepayment');

// Routes for typepayment management
router.post('/typepayment', post_typepayment);
router.put('/typepayment/:typepayment_uuid', put_typepayment);
router.delete('/typepayment/:typepayment_uuid', delete_typepayment);
router.get('/typepayment/:typepayment_uuid', get_detail_typepayment);
router.get('/typepayment', get_all_typepayment);
router.get('/typepayment/unique', get_uniqe_typepayment);
router.get('/typepayment/count', get_count_typepayment);

module.exports = router;
