const express = require('express');
const router = express.Router();
const { handleAudit } = require('../controllers/auditController');
const { validateAuditRequest } = require('../middlewares/validateRequest');

// POST /api/audit
router.post('/audit', validateAuditRequest, handleAudit);

// GET /api/audit (query parameter support)
router.get('/audit', validateAuditRequest, handleAudit);

module.exports = router;
