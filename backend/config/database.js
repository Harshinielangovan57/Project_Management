'use strict';
require('dotenv').config();

const { Sequelize } = require('sequelize');

let sequelize;

try {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (dbUrl) {
    // Use DATABASE_URL (Supabase / production PostgreSQL)
    const isLocalhost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
    sequelize = new Sequelize(dbUrl, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: !isLocalhost
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    });
    console.log('[Database] Using DATABASE_URL for PostgreSQL');
  } else {
    // Fallback to individual env vars (DB_HOST, DB_USER, etc.)
    sequelize = new Sequelize(
      process.env.DB_NAME || 'project_management',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        dialect: 'postgres',
        logging: false,
        dialectOptions: process.env.DB_SSL === 'true'
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
      }
    );
    console.log('[Database] Using individual DB_* env vars for PostgreSQL');
  }
} catch (err) {
  console.error('[Database] FATAL: Failed to initialize Sequelize:', err.message);
  console.error('[Database] DATABASE_URL present:', !!process.env.DATABASE_URL);
  throw err;
}

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('[Database] Connection established successfully');
    return sequelize;
  } catch (err) {
    console.error('[Database] Connection failed:', err.message);
    throw err;
  }
};

module.exports = { sequelize, connectDatabase };
