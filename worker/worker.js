/**
 * CodeForge Worker
 * Pulls submissions from Redis queue and simulates code evaluation.
 * In production, replace the sandbox with a real isolated execution engine
 * (e.g., Docker-in-Docker, Firecracker, Judge0, or Piston API).
 */

require("dotenv").config({ path: "../backend/.env" });
const Redis = require("ioredis");
const { Pool } = require("pg");

const redis = new Redis(process.env.REDIS_URL);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

console.log("🔧 CodeForge Worker started — waiting for submissions...");

const processSubmission = async (data) => {
  const { submissionId, challenge_id, language, code, userId } = data;
  console.log(`⚙️  Processing submission ${submissionId} [${language}]`);

  // Update status to running
  await pool.query("UPDATE submissions SET status = 'running' WHERE id = $1", [submissionId]);

  // ─── SANDBOX PLACEHOLDER ──────────────────────────────────────────────────
  // TODO: Replace this block with a real sandboxed execution engine.
  // Options: Piston API, Judge0, Docker sandbox, gVisor, Firecracker
  // This simulation just checks if code is non-empty and returns mock results.
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

  const mockPassed = code.length > 20 && !code.includes("while(true)");
  const status = mockPassed ? "accepted" : "wrong_answer";
  const runtime_ms = Math.floor(50 + Math.random() * 200);
  const memory_kb = Math.floor(10000 + Math.random() * 5000);
  const test_results = [
    { test: 1, passed: mockPassed, input: "sample", expected: "result", actual: mockPassed ? "result" : "wrong" },
    { test: 2, passed: mockPassed, input: "sample2", expected: "result2", actual: mockPassed ? "result2" : "wrong" },
  ];
  // ─── END SANDBOX PLACEHOLDER ──────────────────────────────────────────────

  await pool.query(
    "UPDATE submissions SET status = $1, runtime_ms = $2, memory_kb = $3, test_results = $4 WHERE id = $5",
    [status, runtime_ms, memory_kb, JSON.stringify(test_results), submissionId]
  );

  // Award points if accepted
  if (status === "accepted") {
    const challenge = await pool.query("SELECT points FROM challenges WHERE id = $1", [challenge_id]);
    const pts = challenge.rows[0]?.points || 0;

    const alreadySolved = await pool.query(
      "SELECT id FROM submissions WHERE user_id = $1 AND challenge_id = $2 AND status = 'accepted' AND id != $3",
      [userId, challenge_id, submissionId]
    );

    if (alreadySolved.rows.length === 0) {
      await pool.query(
        "UPDATE users SET points = points + $1, solved_count = solved_count + 1 WHERE id = $2",
        [pts, userId]
      );
    }
  }

  console.log(`✅ Submission ${submissionId} completed: ${status}`);
};

// Main event loop — BLPOP blocks until a job arrives
const run = async () => {
  while (true) {
    try {
      const result = await redis.brpop("submission_queue", 5);
      if (result) {
        const [, raw] = result;
        const data = JSON.parse(raw);
        await processSubmission(data);
      }
    } catch (err) {
      console.error("Worker error:", err.message);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
};

run();
