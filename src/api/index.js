// Vercel Serverless Function entry point.
// This wraps the existing Express app so it runs as a serverless handler.
// Vercel automatically routes all /api/* requests here via vercel.json.

require('dotenv').config();
const app = require('../app');

module.exports = app;
