const express = require('express');
const router = express.Router();
const {authenticate, superAdminAndAdmin, superAdminOnly} = require('../middleware/authMiddleware');
const { cekAccessControl } = require('../middleware/accessControlMiddleware');

const {
    post_levels,
    put_levels,
    delete_levels,
    get_detail_level,
    get_all_levels,
    get_unique_levels,
    get_count_levels,
} = require('../controllers/c_levels');

// Routes for level management
router.post('/level', authenticate, cekAccessControl, post_levels);
router.put('/level/:level_uuid', authenticate, cekAccessControl, put_levels);
router.delete('/level/:level_uuid', authenticate, cekAccessControl, delete_levels);
router.get('/level/:level_uuid', authenticate, cekAccessControl, get_detail_level);
router.get('/level', authenticate, cekAccessControl, get_all_levels);
router.get('/level/unique', authenticate, cekAccessControl, get_unique_levels);
router.get('/level/count', authenticate, cekAccessControl, get_count_levels);

module.exports = router;
