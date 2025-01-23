const express = require('express');
const router = express.Router();
const{authenticate, superAdminAndAdmin, } = require('../middleware/authMiddleware');
const { cekAccessControl } = require('../middleware/accessControlMiddleware');

const {
    post_table,
    put_table,
    delete_table,
    get_detail_table,
    get_all_table,
    get_uniqe_table,
    get_count_table,
} = require('../controllers/c_table');

// Routes for table management
router.post('/table', authenticate, post_table);
router.put('/table/:table_uuid', authenticate, put_table);
router.delete('/table/:table_uuid', authenticate, delete_table);
router.get('/table/:table_uuid', get_detail_table);
router.get('/table', get_all_table);
router.get('/table/unique', get_uniqe_table);
router.get('/table/count', get_count_table);

module.exports = router;
