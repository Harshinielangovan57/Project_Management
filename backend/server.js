const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Load database config FIRST before any models
const { sequelize, connectDatabase } = require('./config/database');

// Load model associations after sequelize is initialized
require('./models');

const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & utility middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to /api
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: sequelize.getDialect()
  });
});

// Mount feature routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler for undefined API routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server after ensuring DB connection & model synchronization
const startServer = async () => {
  try {
    await connectDatabase();
    await sequelize.sync();
    console.log('[Database] Models synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`[Server] Project Management Backend running on http://localhost:${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('[Server Error] Failed to start server:', error);
    process.exit(1);
  }
};

// Vercel serverless: initialize DB connection once at module load time
// app.listen() must NOT be called in serverless environments
if (!process.env.VERCEL) {
  startServer();
} else {
  // Ensure DB connection and sync tables on serverless startup
  connectDatabase()
    .then(() => sequelize.sync())
    .catch((err) => console.error('[Database Error]', err));
}

module.exports = app;
