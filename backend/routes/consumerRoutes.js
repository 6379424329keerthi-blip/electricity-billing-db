const express = require('express');
const router = express.Router();
const consumerController = require('../controllers/consumerController');
const { verifyToken, adminOnly, staffOrAdmin } = require('../middleware/auth');
const { validate, consumerRules } = require('../validators');

router.get('/', verifyToken, consumerController.getAllConsumers);
router.get('/:id', verifyToken, consumerController.getConsumerById);
router.post('/', verifyToken, staffOrAdmin, validate(consumerRules), consumerController.createConsumer);
router.put('/:id', verifyToken, staffOrAdmin, consumerController.updateConsumer);
router.delete('/:id', verifyToken, adminOnly, consumerController.deleteConsumer);

module.exports = router;
