const express = require('express');
const router = express.Router();
const {authenticate, superAdminAndAdmin, superAdminOnly} = require('../middleware/authMiddleware');
const { cekAccessControl } = require('../middleware/accessControlMiddleware');

const {
    post_announcement,
    put_announcement,
    delete_announcement,
    get_all_announcement,
    get_detail_announcement,
    get_uniqe_announcement,
    get_count_announcement,
} = require('../controllers/c_announcement')

// Routes for announcement management
router.post('/announcement', authenticate, cekAccessControl, post_announcement);
router.put('/announcement/:announcement_uuid', authenticate, cekAccessControl, put_announcement);
router.delete('/announcement/:announcement_uuid', authenticate, cekAccessControl, delete_announcement);
router.get('/announcement', authenticate, cekAccessControl, get_all_announcement);
router.get('/announcement/:announcement_uuid', authenticate, cekAccessControl, get_detail_announcement);
router.get('/announcement/unique', authenticate, cekAccessControl, get_uniqe_announcement);
router.get('/announcement/count', authenticate, cekAccessControl, get_count_announcement);

module.exports = router;
