const { Pool } = require("pg");
const logger = require("./logger");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    logger.info("✅ PostgreSQL connected");
    client.release();
  } catch (err) {
    logger.error("❌ PostgreSQL connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
