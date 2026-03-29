const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { pool } = require("../config/db");
const { getRedis } = require("../config/redis");
const { authenticate } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many submissions. Please wait." },
});

const ALLOWED_LANGUAGES = ["javascript", "python", "java", "cpp", "go"];

// POST /api/submissions — submit code
router.post("/", authenticate, submitLimiter, async (req, res) => {
  const { challenge_id, language, code } = req.body;

  if (!challenge_id || !language || !code) {
    return res.status(400).json({ error: "challenge_id, language, and code are required" });
  }
  if (!ALLOWED_LANGUAGES.includes(language)) {
    return res.status(400).json({ error: `Language must be one of: ${ALLOWED_LANGUAGES.join(", ")}` });
  }
  if (code.length > 50000) {
    return res.status(400).json({ error: "Code exceeds maximum allowed length" });
  }

  const challenge = await pool.query("SELECT id FROM challenges WHERE id = $1 AND is_active = true", [challenge_id]);
  if (!challenge.rows[0]) return res.status(404).json({ error: "Challenge not found" });

  const submissionId = uuidv4();
  await pool.query(
    "INSERT INTO submissions (id, user_id, challenge_id, language, code, status) VALUES ($1, $2, $3, $4, $5, 'pending')",
    [submissionId, req.user.id, challenge_id, language, code]
  );

  // Push to Redis queue for worker
  await getRedis().lpush("submission_queue", JSON.stringify({ submissionId, challenge_id, language, code, userId: req.user.id }));

  res.status(202).json({ submissionId, status: "pending", message: "Submission queued for evaluation" });
});

// GET /api/submissions/:id — poll result
router.get("/:id", authenticate, async (req, res) => {
  const result = await pool.query(
    "SELECT id, challenge_id, language, status, runtime_ms, memory_kb, test_results, submitted_at FROM submissions WHERE id = $1 AND user_id = $2",
    [req.params.id, req.user.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: "Submission not found" });
  res.json(result.rows[0]);
});

// GET /api/submissions — user's submission history
router.get("/", authenticate, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const result = await pool.query(
    `SELECT s.id, c.title as challenge_title, c.slug, s.language, s.status, s.runtime_ms, s.submitted_at
     FROM submissions s JOIN challenges c ON s.challenge_id = c.id
     WHERE s.user_id = $1 ORDER BY s.submitted_at DESC LIMIT $2 OFFSET $3`,
    [req.user.id, limit, offset]
  );
  res.json(result.rows);
});

module.exports = router;
