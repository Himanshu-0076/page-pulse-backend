const { ERRORS } = require('../constants/messages');

/**
 * Centralized error handler middleware for Express.
 */
function errorHandler(err, req, res, next) {
  console.error('[PagePulse Error]:', err.message || err);

  const statusCode = err.status || 500;
  const message = err.message || ERRORS.SERVER_ERROR;

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = { errorHandler };
