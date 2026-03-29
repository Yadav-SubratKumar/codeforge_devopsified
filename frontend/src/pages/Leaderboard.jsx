import React, { useEffect, useState } from "react";
import api from "../api";

const MEDALS = ["🥇", "🥈", "🥉"];

const s = {
  page: { maxWidth: "700px", margin: "0 auto", padding: "2.5rem 1.5rem" },
  title: { fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" },
  sub: { color: "var(--text-secondary)", fontSize: "14px", marginBottom: "2rem" },
  row: (i) => ({
    display: "flex", alignItems: "center", gap: "1rem",
    padding: "14px 16px", borderRadius: "var(--radius-md)",
    background: i === 0 ? "rgba(0,255,136,0.05)" : "var(--bg-surface)",
    border: `1px solid ${i === 0 ? "rgba(0,255,136,0.2)" : "var(--border)"}`,
    marginBottom: "8px",
    transition: "background var(--transition)",
  }),
  rank: { width: "32px", textAlign: "center", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-muted)", fontSize: "13px" },
  name: { flex: 1, fontWeight: 600 },
  solved: { fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" },
  pts: { fontFamily: "var(--font-mono)", fontWeight: 800, color: "var(--accent)", fontSize: "14px" },
  spinner: { width: 32, height: 32, margin: "4rem auto", border: "3px solid var(--border)", borderTop: "3px solid var(--accent)", borderRadius: "50%" },
};

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users/leaderboard")
      .then(({ data }) => setUsers(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.page} className="fade-in">
      <h1 style={s.title}>Leaderboard</h1>
      <p style={s.sub}>Top coders ranked by total points earned.</p>
      {loading ? (
        <div style={s.spinner} className="spin" />
      ) : (
        users.map((u, i) => (
          <div key={u.id} style={s.row(i)}>
            <div style={s.rank}>{MEDALS[i] || `#${i + 1}`}</div>
            <div style={s.name}>{u.username}</div>
            <div style={s.solved}>{u.solved_count} solved</div>
            <div style={s.pts}>⚡ {u.points} pts</div>
          </div>
        ))
      )}
      {!loading && users.length === 0 && (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem" }}>
          No users yet. Be the first to sign up and solve!
        </div>
      )}
    </div>
  );
}
