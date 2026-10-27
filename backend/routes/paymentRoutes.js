const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, staffOrAdmin } = require('../middleware/auth');
const { validate, paymentRules } = require('../validators');

router.get('/', verifyToken, paymentController.getAllPayments);
router.post('/', verifyToken, validate(paymentRules), paymentController.recordPayment);
router.get('/bill/:id', verifyToken, paymentController.getBillPayments);

module.exports = router;
