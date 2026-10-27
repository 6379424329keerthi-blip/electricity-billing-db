const express = require('express');
const router = express.Router();
const tariffController = require('../controllers/tariffController');
const { verifyToken, adminOnly } = require('../middleware/auth');
const { validate, tariffRules } = require('../validators');

router.get('/', verifyToken, tariffController.getAllTariffs);
router.post('/', verifyToken, adminOnly, validate(tariffRules), tariffController.createTariff);
router.put('/:id', verifyToken, adminOnly, tariffController.updateTariff);
router.delete('/:id', verifyToken, adminOnly, tariffController.deleteTariff);

module.exports = router;
