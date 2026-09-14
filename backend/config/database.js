const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbDialect = (process.env.DB_DIALECT || 'postgres').toLowerCase();
let sequelize;

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
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: (process.env.DB_SSL === 'true' || !isLocalhost) ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {},
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  } else {
    sequelize = new Sequelize(
      process.env.DB_NAME || 'project_management',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'postgres',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        dialectOptions: process.env.DB_SSL === 'true' ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        } : {},
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );
  }
}

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[Database] Connected successfully using dialect: ${sequelize.getDialect().toUpperCase()}`);
    return sequelize;
  } catch (err) {
    console.error(`[Database Error] Connection failed:`, err.message);
    throw err;
  }
};

const exported = {
  sequelize,
  connectDatabase
};

module.exports = exported;
module.exports.default = exported;
module.exports.sequelize = sequelize;
module.exports.connectDatabase = connectDatabase;
