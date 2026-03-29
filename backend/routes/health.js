const express = require("express");
const { pool } = require("../config/db");
const { getRedis } = require("../config/redis");

const router = express.Router();

router.get("/", async (req, res) => {
  const health = { status: "ok", timestamp: new Date().toISOString(), services: {} };

  try {
    await pool.query("SELECT 1");
    health.services.postgres = "healthy";
  } catch { health.services.postgres = "unhealthy"; health.status = "degraded"; }

  try {
    await getRedis().ping();
    health.services.redis = "healthy";
  } catch { health.services.redis = "unhealthy"; health.status = "degraded"; }

  res.status(health.status === "ok" ? 200 : 503).json(health);
});

module.exports = router;
