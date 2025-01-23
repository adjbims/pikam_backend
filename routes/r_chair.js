const express = require('express');
const router = express.Router();
const {authenticate, superAdminAndAdmin, superAdminOnly} = require('../middleware/authMiddleware');
const { cekAccessControl } = require('../middleware/accessControlMiddleware');

const {
    post_chair,
    put_chair,
    delete_chair,
    get_all_chair,
    get_detail_chair,
    get_uniqe_chair,
    get_count_chair,
} = require('../controllers/c_chair')

// Routes for chair management
router.post('/chair',authenticate, post_chair);
router.put('/chair/:chair_uuid', authenticate, put_chair);
router.delete('/chair/:chair_uuid', authenticate, delete_chair);
router.get('/chair', get_all_chair);
router.get('/chair/:chair_uuid', get_detail_chair);
router.get('/chair/unique', get_uniqe_chair);
router.get('/chair/count', get_count_chair);

module.exports = router;
