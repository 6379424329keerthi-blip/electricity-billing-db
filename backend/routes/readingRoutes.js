const express = require('express');
const router = express.Router();
const readingController = require('../controllers/readingController');
const { verifyToken, staffOrAdmin } = require('../middleware/auth');
const { validate, readingRules } = require('../validators');

router.get('/', verifyToken, readingController.getAllReadings);
router.get('/:id', verifyToken, readingController.getReadingById);
router.get('/meter/:meterId/latest', verifyToken, readingController.getLatestMeterReading);
router.post('/', verifyToken, staffOrAdmin, validate(readingRules), readingController.createReading);

module.exports = router;
