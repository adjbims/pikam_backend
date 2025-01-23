const express = require('express');
const router = express.Router();
const {authenticate, superAdminAndAdmin, superAdminOnly} = require('../middleware/authMiddleware');
const { cekAccessControl } = require('../middleware/accessControlMiddleware');

const {
    post_room,
    put_room,
    delete_room,
    get_detail_room,
    get_all_room,
    get_uniqe_room,
    get_count_room,
} = require('../controllers/c_room');

// Routes for room management
router.post('/room', authenticate, cekAccessControl, post_room);
router.put('/room/:room_uuid', authenticate, cekAccessControl, put_room);
router.delete('/room/:room_uuid', authenticate, cekAccessControl, delete_room);
router.get('/room/:room_uuid', get_detail_room);
router.get('/room', get_all_room);
router.get('/room/unique', get_uniqe_room);
router.get('/room/count', get_count_room);

module.exports = router;
