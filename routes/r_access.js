const express = require('express');
const router = express.Router();
const {authenticate, superAdminAndAdmin, superAdminOnly}  = require('../middleware/authMiddleware');
const { cekAccessControl } = require('../middleware/accessControlMiddleware');

const {
    post_access,
    post_access_v2,
    put_access,
    delete_access,
    get_all_access,
    get_detail_access,
    get_unique_access,
    get_count_access,
} = require('../controllers/c_access')

// Routes for access management
router.post('/access', authenticate, cekAccessControl, post_access);
router.post('/access_v2', authenticate, cekAccessControl, post_access_v2);
router.put('/access/:access_uuid', authenticate, cekAccessControl, put_access);
router.delete('/access/:access_uuid', authenticate, cekAccessControl,  delete_access);
router.get('/access', authenticate, cekAccessControl, get_all_access);
router.get('/access/:access_uuid', authenticate, cekAccessControl,  get_detail_access);
router.get('/access/unique', authenticate, cekAccessControl,  get_unique_access);
router.get('/access/count', authenticate, cekAccessControl,  get_count_access);
module.exports = router;
