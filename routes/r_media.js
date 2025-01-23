const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');

const {
    get_all_media,
    post_upload_media,
    get_detail_media,
    delete_media,
    get_detail_mediabymediauuid,
} = require('../controllers/c_media');

router.get('/media/get_all', get_all_media);
router.post('/media/upload_media/:table_uuid', authenticate, post_upload_media);
router.delete('/media/:media_uuid', delete_media);
router.get('/media/:table_uuid', get_detail_media);
router.get('/medias/:media_uuid', get_detail_mediabymediauuid);

module.exports = router;