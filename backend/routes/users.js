const express = require("express");
const { pool } = require("../config/db");
const { getRedis } = require("../config/redis");

const router = express.Router();

// GET /api/users/leaderboard
router.get("/leaderboard", async (req, res) => {
  const result = await pool.query(
    "SELECT id, username, points, solved_count FROM users ORDER BY points DESC, solved_count DESC LIMIT 50"
  );
  res.json(result.rows);
});

// GET /api/users/:username/profile
router.get("/:username/profile", async (req, res) => {
  const result = await pool.query(
    "SELECT id, username, points, solved_count, created_at FROM users WHERE username = $1",
    [req.params.username]
  );
  if (!result.rows[0]) return res.status(404).json({ error: "User not found" });
  res.json(result.rows[0]);
});

module.exports = router;
