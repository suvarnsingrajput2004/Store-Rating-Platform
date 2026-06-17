const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Set up CORS
app.use(cors());

// Request Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // Standard Apache combined log output
} else {
  app.use(morgan('dev')); // Concise output colored by response status for development use
}

// Parse JSON payloads
app.use(express.json());

// Parse URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// Default health check endpoint
app.get('/api/v1/health', async (req, res) => {
  try {
    // Ping DB to ensure connectivity
    await db.execute('SELECT 1');
    res.status(200).json({ status: 'OK', database: 'connected', timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected', timestamp: new Date() });
  }
});

// API version 1 routing
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/stores', storeRoutes);
app.use('/api/v1/ratings', ratingRoutes);
app.use('/api/v1/owner', ownerRoutes);

// Handle 404 routes
app.use((req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
