const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id                   SERIAL PRIMARY KEY,
      name                 VARCHAR(255)        NOT NULL,
      email                VARCHAR(255) UNIQUE NOT NULL,
      password             VARCHAR(255)        NOT NULL,
      is_verified          BOOLEAN             NOT NULL DEFAULT FALSE,
      verification_token   VARCHAR(255),
      reset_token          VARCHAR(255),
      reset_token_expires  TIMESTAMPTZ,
      created_at           TIMESTAMPTZ         DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;

    CREATE TABLE IF NOT EXISTS cart_items (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id VARCHAR(50) NOT NULL,
      quantity   INTEGER NOT NULL DEFAULT 1,
      size       VARCHAR(20) NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (user_id, product_id, size)
    );
    CREATE INDEX IF NOT EXISTS cart_items_user_idx ON cart_items (user_id);

    CREATE TABLE IF NOT EXISTS orders (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total      NUMERIC(10,2) NOT NULL,
      status     VARCHAR(30) NOT NULL DEFAULT 'placed',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS orders_user_idx ON orders (user_id);

    -- Snapshots name/price/image at time of purchase, deliberately independent
    -- of the live catalogue (so order history stays accurate even if a
    -- product's price or name changes later).
    CREATE TABLE IF NOT EXISTS order_items (
      id         SERIAL PRIMARY KEY,
      order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id VARCHAR(50) NOT NULL,
      name       VARCHAR(255) NOT NULL,
      price      NUMERIC(10,2) NOT NULL,
      quantity   INTEGER NOT NULL,
      size       VARCHAR(20) NOT NULL DEFAULT '',
      image      VARCHAR(255)
    );
    CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);
  `);
  console.log('  PostgreSQL ready');
}

module.exports = { pool, initDb };
