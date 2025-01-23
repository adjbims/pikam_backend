const express = require('express');
const router = express.Router();
const {authenticate, superAdminAndAdmin, superAdminOnly} = require('../middleware/authMiddleware');
const { cekAccessControl } = require('../middleware/accessControlMiddleware');

const {
    post_module,
    put_module,
    delete_module,
    get_detail_module,
    get_all_module,
    get_unique_module,
    get_count_module,
} = require('../controllers/c_modules');

// Routes for module management
router.post('/module', authenticate, cekAccessControl, post_module);
router.put('/module/:module_uuid', authenticate, cekAccessControl, put_module);
router.delete('/module/:module_uuid', authenticate, cekAccessControl, delete_module);
router.get('/module/:module_uuid', authenticate, cekAccessControl, get_detail_module);
router.get('/module', authenticate, cekAccessControl, get_all_module);
router.get('/module/unique', authenticate, cekAccessControl, get_unique_module);
router.get('/module/count', authenticate, cekAccessControl, get_count_module);

module.exports = router;