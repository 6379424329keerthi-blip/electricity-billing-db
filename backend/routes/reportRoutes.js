const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, staffOrAdmin } = require('../middleware/auth');

router.get('/monthly-consumption', verifyToken, staffOrAdmin, reportController.getMonthlyConsumptionReport);
router.get('/monthly-revenue', verifyToken, staffOrAdmin, reportController.getMonthlyRevenueReport);
router.get('/outstanding-bills', verifyToken, staffOrAdmin, reportController.getOutstandingBillsReport);
router.get('/category-breakdown', verifyToken, staffOrAdmin, reportController.getCategoryBreakdownReport);

module.exports = router;
