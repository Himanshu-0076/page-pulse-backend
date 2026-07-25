const { performAudit } = require('../services/auditService');
const { SUCCESS } = require('../constants/messages');

/**
 * Controller handling POST /api/audit and GET /api/audit
 */
async function handleAudit(req, res, next) {
  try {
    const targetUrl = req.targetUrl;
    const reportData = await performAudit(targetUrl);

    return res.status(200).json({
      success: true,
      message: SUCCESS.AUDIT_COMPLETE,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { handleAudit };
