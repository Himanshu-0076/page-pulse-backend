const express = require('express');
const cors = require('cors');
const auditRoutes = require('./routes/auditRoutes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// CORS — in production, restrict to the deployed frontend origin via env var.
// Set CORS_ORIGIN in Vercel dashboard (e.g. https://page-pulse.vercel.app).
// Leave unset to allow all origins (useful for development / open APIs).
const corsOptions = process.env.CORS_ORIGIN
  ? { origin: process.env.CORS_ORIGIN, optionsSuccessStatus: 200 }
  : {};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'PagePulse Audit Engine',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', auditRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
