const express = require('express');
const router = express.Router();
const  { authenticate } = require('../middleware/authMiddleware');
const { cekAccessControl } = require('../middleware/accessControlMiddleware');

const {
    post_packagemenu,
    put_packagemenu,
    delete_packagemenu,
    get_all_packagemenu,
    get_detail_packagemenu,
    get_uniqe_packagemenu,
    get_count_packagemenu,
} = require('../controllers/c_packagemenu')

// Routes for packagemenu management
router.post('/packagemenu', authenticate, cekAccessControl, post_packagemenu);
router.put('/packagemenu/:packagemenu_uuid', authenticate, cekAccessControl, put_packagemenu);
router.delete('/packagemenu/:packagemenu_uuid', authenticate, cekAccessControl, delete_packagemenu);
router.get('/packagemenu', get_all_packagemenu);
router.get('/packagemenu/:packagemenu_uuid', get_detail_packagemenu);
router.get('/packagemenu/unique', authenticate, cekAccessControl, get_uniqe_packagemenu);
router.get('/packagemenu/count', authenticate, cekAccessControl, get_count_packagemenu);


module.exports = router;
