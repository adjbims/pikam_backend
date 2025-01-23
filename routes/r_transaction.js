const express = require('express');
const router = express.Router();
const  { authenticate } = require('../middleware/authMiddleware');
const { cekAccessControl } = require('../middleware/accessControlMiddleware');

const {
    post_transaction,
    put_transaction,
    delete_transaction,
    get_transactions_user,
    get_all_transaction,
    get_detail_transaction,
    get_uniqe_transaction,
    get_count_transaction,
    get_transaction_bytransaction_code,
} = require('../controllers/c_transaction')

// Routes for transaction management
router.get('/transaction/:transaction_code', authenticate, cekAccessControl, get_transaction_bytransaction_code);
router.get('/transaction/detail/:transaction_uuid',authenticate, cekAccessControl, get_detail_transaction);
router.post('/transaction-guest',authenticate, post_transaction);
router.put('/transaction/:transaction_uuid',authenticate, cekAccessControl, put_transaction);
router.delete('/transaction/:transaction_uuid',authenticate, cekAccessControl, delete_transaction);
router.get('/transactions', authenticate, cekAccessControl, get_transactions_user)
router.get('/transaction',authenticate, cekAccessControl, get_all_transaction);
router.get('/transaction/unique',authenticate, cekAccessControl, get_uniqe_transaction);
router.get('/transaction/count',authenticate, cekAccessControl, get_count_transaction);


module.exports = router;
