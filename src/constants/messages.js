module.exports = {
  ERRORS: {
    MISSING_URL: 'Please provide a target URL to audit.',
    INVALID_URL: 'The provided URL is invalid. Please ensure it begins with http:// or https://',
    FETCH_FAILED: 'Failed to retrieve the webpage. Please verify the URL is accessible.',
    TIMEOUT: 'Request timed out while trying to reach the target URL.',
    SERVER_ERROR: 'An unexpected internal server error occurred during audit.'
  },
  SUCCESS: {
    AUDIT_COMPLETE: 'Page health and SEO audit completed successfully.'
  }
};
