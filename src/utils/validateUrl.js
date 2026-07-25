/**
 * Validates whether a string is a properly formatted HTTP/HTTPS URL with domain/host.
 * @param {string} urlString
 * @returns {boolean}
 */
function validateUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return false;
  }
  const trimmed = urlString.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const hostname = parsed.hostname;
    // Hostname must contain at least one dot or be localhost
    if (!hostname || (!hostname.includes('.') && hostname !== 'localhost')) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Normalizes a URL string by trimming whitespace and ensuring http/https protocol.
 * @param {string} urlString 
 * @returns {string}
 */
function normalizeUrl(urlString) {
  if (!urlString) return '';
  let trimmed = urlString.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

module.exports = {
  validateUrl,
  normalizeUrl
};
