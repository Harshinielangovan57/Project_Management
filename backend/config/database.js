'use strict';
require('dotenv').config();

const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

let sequelize;

try {
  const dbDialect = (process.env.DB_DIALECT || 'postgres').toLowerCase();

  if (dbDialect === 'sqlite') {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(dataDir, 'dev.sqlite'),
      logging: false
    });
  } else {
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (dbUrl) {
      const isLocalhost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
      sequelize = new Sequelize(dbUrl, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: !isLocalhost
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
      });
    } else {
      // Fallback to individual env vars
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
    }
  }
} catch (err) {
  console.error('[Database] FATAL: Failed to initialize Sequelize:', err.message);
  console.error('[Database] ENV CHECK - DATABASE_URL present:', !!process.env.DATABASE_URL);
  console.error('[Database] ENV CHECK - DB_DIALECT:', process.env.DB_DIALECT);
  throw err;
}

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('[Database] Connection established:', sequelize.getDialect().toUpperCase());
    return sequelize;
  } catch (err) {
    console.error('[Database] Connection failed:', err.message);
    throw err;
  }
};

module.exports = { sequelize, connectDatabase };
