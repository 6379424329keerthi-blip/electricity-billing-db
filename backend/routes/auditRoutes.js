const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { verifyToken, adminOnly } = require('../middleware/auth');

router.get('/', verifyToken, adminOnly, auditController.getAuditLogs);

module.exports = router;
