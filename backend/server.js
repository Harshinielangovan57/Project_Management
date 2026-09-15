'use strict';

// ─── Load env vars FIRST (no-op in Vercel since vars are injected) ───────────
require('dotenv').config();

// ─── Database & Models ───────────────────────────────────────────────────────
const { sequelize, connectDatabase } = require('./config/database');
require('./models'); // sets up associations

// ─── Middleware ───────────────────────────────────────────────────────────────
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const errorHandler      = require('./middleware/errorHandler');
const { apiLimiter }    = require('./middleware/rateLimiter');

// ─── Routes ──────────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const projectRoutes   = require('./routes/projectRoutes');
const taskRoutes      = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// ─── App ─────────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

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
app.use('/api', apiLimiter);

// ─── Health / Debug ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status    : 'healthy',
    timestamp : new Date().toISOString(),
    database  : sequelize.getDialect(),
    env       : process.env.NODE_ENV || 'development'
  });
});

// ─── Feature Routes ──────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/projects',  projectRoutes);
app.use('/api/tasks',     taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success : false,
    message : `${req.method} ${req.originalUrl} not found`
  });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── DB init promise (reused across warm serverless invocations) ─────────────
let dbReady = false;
const initDb = connectDatabase()
  .then(() => sequelize.sync())
  .then(() => { dbReady = true; console.log('[DB] Ready'); })
  .catch((err) => console.error('[DB] Init failed:', err.message));

// ─── Local dev server ─────────────────────────────────────────────────────────
if (!process.env.VERCEL) {
  initDb.then(() => {
    app.listen(PORT, () => {
      console.log(`[Server] http://localhost:${PORT}  (${process.env.NODE_ENV || 'development'})`);
    });
  }).catch((err) => {
    console.error('[Server] Startup failed:', err);
    process.exit(1);
  });
}

// Vercel serverless entry point
module.exports = app;
