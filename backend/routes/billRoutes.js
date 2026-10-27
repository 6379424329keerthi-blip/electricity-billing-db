const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { verifyToken, staffOrAdmin } = require('../middleware/auth');
const { validate, billGenerateRules } = require('../validators');

router.get('/', verifyToken, billController.getAllBills);
router.get('/:id', verifyToken, billController.getBillById);
router.post('/generate', verifyToken, staffOrAdmin, validate(billGenerateRules), billController.generateBill);

module.exports = router;
