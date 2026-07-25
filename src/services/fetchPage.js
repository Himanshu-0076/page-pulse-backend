const httpClient = require('../config/axiosConfig');
const { startTimer } = require('../utils/measureTime');

/**
 * Fetches HTML page content and captures performance metrics.
 * @param {string} url 
 * @returns {Promise<{ html: string, responseTimeMs: number, statusCode: number, headers: object, contentLengthBytes: number, finalUrl: string }>}
 */
async function fetchPage(url) {
  const getTimer = startTimer();

  try {
    const response = await httpClient.get(url, {
      responseType: 'text',
      // Accept ALL status codes — even 4xx/5xx pages have auditable HTML.
      // The status code is passed through to the audit report.
      validateStatus: () => true
    });

    const responseTimeMs = getTimer();
    const contentType = (response.headers['content-type'] || '').toLowerCase();

    // Verify response is HTML (skip check for error status pages — they may still return HTML)
    if (response.status < 400 && contentType && !contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      const err = new Error(`Target URL returned non-HTML content (${contentType.split(';')[0] || contentType})`);
      err.status = 400;
      throw err;
    }

    const html = typeof response.data === 'string' ? response.data : String(response.data);
    const contentLengthBytes = Buffer.byteLength(html, 'utf8');

    return {
      html,
      responseTimeMs,
      statusCode: response.status,
      headers: response.headers,
      contentLengthBytes,
      finalUrl: response.request?.res?.responseUrl || url
    };
  } catch (error) {
    const responseTimeMs = getTimer();

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      const err = new Error('Target server request timed out.');
      err.status = 504;
      throw err;
    }

    if (error.response) {
      const err = new Error(`Server returned HTTP ${error.response.status}: ${error.response.statusText || 'Error'}`);
      err.status = error.response.status;
      err.responseTimeMs = responseTimeMs;
      throw err;
    }

    const err = new Error(`Could not connect to target host: ${error.message}`);
    err.status = 502;
    throw err;
  }
}

module.exports = { fetchPage };
