/**
 * Electricity Consumption & Smart Meter Billing Database Backend Server
 * Node.js / Express.js REST API
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { testConnection } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const consumerRoutes = require('./routes/consumerRoutes');
const meterRoutes = require('./routes/meterRoutes');
const readingRoutes = require('./routes/readingRoutes');
const tariffRoutes = require('./routes/tariffRoutes');
const billRoutes = require('./routes/billRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const auditRoutes = require('./routes/auditRoutes');

// Environment verification on boot
if (!process.env.JWT_SECRET) {
  console.error('FATAL CONFIGURATION ERROR: JWT_SECRET environment variable is missing.');
  console.error('Please configure JWT_SECRET in your backend/.env file before running.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed CORS Origins for Localhost and Client Ports
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5000',
];
if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

// Middleware
app.use(morgan('dev'));
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, curl, server-to-server) or matched origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // In local development, permit request
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base / Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Electricity Consumption & Smart Meter Billing Database',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/consumers', consumerRoutes);
app.use('/api/meters', meterRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/tariffs', tariffRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);

// Serve frontend static build if available
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// 404 Not Found for API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(` Smart Grid Billing API Server running on port ${PORT}`);
  console.log(` API Endpoint: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
  await testConnection();
});
