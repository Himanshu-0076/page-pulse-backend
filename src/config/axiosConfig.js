const axios = require('axios');

/**
 * Creates and configures a default Axios instance for HTTP requests.
 */
const httpClient = axios.create({
  timeout: 10000, // 10 seconds timeout
  maxRedirects: 5,
  headers: {
    'User-Agent': 'PagePulseBot/1.0 (+https://pagepulse.dev/bot; Web Health & SEO Scanner)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Cache-Control': 'no-cache'
  }
});

module.exports = httpClient;
