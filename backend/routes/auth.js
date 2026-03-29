const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { pool } = require("../config/db");
const { cacheSet } = require("../config/redis");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register
router.post("/register", [
  body("username").trim().isLength({ min: 3, max: 50 }).isAlphanumeric(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }).matches(/^(?=.*[A-Za-z])(?=.*\d)/),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, email, password } = req.body;
  try {
    const exists = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, role",
      [username, email, hash]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, points: user.points } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/logout
router.post("/logout", authenticate, async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  await cacheSet(`blacklist:${token}`, true, 7 * 24 * 60 * 60); // blacklist for 7 days
  res.json({ message: "Logged out successfully" });
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  const result = await pool.query(
    "SELECT id, username, email, role, points, solved_count, created_at FROM users WHERE id = $1",
    [req.user.id]
  );
  res.json(result.rows[0]);
});

module.exports = router;
