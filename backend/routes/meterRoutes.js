const express = require('express');
const router = express.Router();
const meterController = require('../controllers/meterController');
const { verifyToken, adminOnly, staffOrAdmin } = require('../middleware/auth');
const { validate, meterRules } = require('../validators');

router.get('/', verifyToken, meterController.getAllMeters);
router.post('/', verifyToken, adminOnly, validate(meterRules), meterController.createMeter);
router.put('/:id', verifyToken, staffOrAdmin, meterController.updateMeter);
router.get('/:id/readings', verifyToken, meterController.getMeterReadings);

module.exports = router;
