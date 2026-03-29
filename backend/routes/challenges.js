const express = require("express");
const { pool } = require("../config/db");
const { cacheGet, cacheSet } = require("../config/redis");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/challenges — list all with optional filters
router.get("/", async (req, res) => {
  const { difficulty, category, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const cacheKey = `challenges:${difficulty || "all"}:${category || "all"}:${page}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return res.json(cached);

  let query = "SELECT id, title, slug, difficulty, category, points, is_active FROM challenges WHERE is_active = true";
  const params = [];

  if (difficulty) { params.push(difficulty); query += ` AND difficulty = $${params.length}`; }
  if (category) { params.push(category); query += ` AND category = $${params.length}`; }

  params.push(limit, offset);
  query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

  const result = await pool.query(query, params);
  const countResult = await pool.query("SELECT COUNT(*) FROM challenges WHERE is_active = true");
  const response = { challenges: result.rows, total: parseInt(countResult.rows[0].count), page: +page, limit: +limit };

  await cacheSet(cacheKey, response, 60);
  res.json(response);
});

// GET /api/challenges/:slug — single challenge detail
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `challenge:${slug}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return res.json(cached);

  const result = await pool.query(
    "SELECT id, title, slug, description, difficulty, category, points, template_code, constraints, examples FROM challenges WHERE slug = $1 AND is_active = true",
    [slug]
  );

  if (!result.rows[0]) return res.status(404).json({ error: "Challenge not found" });
  await cacheSet(cacheKey, result.rows[0], 300);
  res.json(result.rows[0]);
});

module.exports = router;
