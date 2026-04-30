const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(255)        NOT NULL,
      email      VARCHAR(255) UNIQUE NOT NULL,
      password   VARCHAR(255)        NOT NULL,
      created_at TIMESTAMPTZ         DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
  `);
  console.log('  PostgreSQL ready');
}

module.exports = { pool, initDb };
