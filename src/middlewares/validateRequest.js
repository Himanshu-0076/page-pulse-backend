const { validateUrl, normalizeUrl } = require('../utils/validateUrl');
const { ERRORS } = require('../constants/messages');

/**
 * Express middleware to validate target URL in request body or query params.
 */
function validateAuditRequest(req, res, next) {
  let rawUrl = req.body?.url || req.query?.url;

  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return res.status(400).json({
      success: false,
      error: ERRORS.MISSING_URL
    });
  }

  const normalized = normalizeUrl(rawUrl);

  if (!validateUrl(normalized)) {
    return res.status(400).json({
      success: false,
      error: ERRORS.INVALID_URL
    });
  }

  // Attach normalized URL to request
  req.targetUrl = normalized;
  next();
}

module.exports = { validateAuditRequest };
