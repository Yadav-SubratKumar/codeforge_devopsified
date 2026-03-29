import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageSpinner, EmptyState, Card } from "../components/UI";
import api from "../api";

const s = {
  page: { maxWidth: "780px", margin: "0 auto", padding: "2.5rem 1.5rem" },
  header: {
    display: "flex", alignItems: "center", gap: "1.5rem",
    marginBottom: "2rem",
  },
  avatar: {
    width: 64, height: 64, borderRadius: "50%",
    background: "var(--bg-elevated)", border: "2px solid var(--accent)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-mono)",
    color: "var(--accent)",
  },
  name: { fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.02em" },
  email: { color: "var(--text-secondary)", fontSize: "13px" },
  statsRow: { display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" },
  stat: {
    flex: "1 1 140px",
    background: "var(--bg-surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: "1.2rem",
    textAlign: "center",
  },
  statNum: { fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent)" },
  statLabel: { fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" },
  sectionTitle: { fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" },
  row: {
    display: "flex", alignItems: "center", gap: "1rem",
    padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
    fontSize: "13px", cursor: "pointer",
  },
  challengeTitle: { flex: 1, fontWeight: 600 },
  lang: { fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "12px" },
  runtime: { fontFamily: "var(--font-mono)", color: "var(--text-secondary)", fontSize: "12px" },
};

export default function Profile() {
  const { user, isAuth } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuth) { navigate("/login"); return; }
    api.get("/submissions")
      .then(({ data }) => setSubmissions(data))
      .finally(() => setLoading(false));
  }, [isAuth, navigate]);

  if (!user) return null;

  const accepted = submissions.filter((s) => s.status === "accepted").length;

  return (
    <div style={s.page} className="fade-in">
      <div style={s.header}>
        <div style={s.avatar}>{user.username?.[0]?.toUpperCase()}</div>
        <div>
          <div style={s.name}>{user.username}</div>
          <div style={s.email}>{user.email}</div>
        </div>
      </div>

      <div style={s.statsRow}>
        {[
          [user.points ?? 0, "Total Points"],
          [user.solved_count ?? 0, "Solved"],
          [submissions.length, "Submissions"],
          [submissions.length > 0 ? Math.round((accepted / submissions.length) * 100) + "%" : "—", "Accept Rate"],
        ].map(([val, label]) => (
          <div key={label} style={s.stat}>
            <div style={s.statNum}>{val}</div>
            <div style={s.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      <Card>
        <div style={s.sectionTitle}>Recent Submissions</div>
        {loading ? (
          <PageSpinner />
        ) : submissions.length === 0 ? (
          <EmptyState icon="📝" title="No submissions yet" subtitle="Solve a challenge to see your history here." />
        ) : (
          submissions.slice(0, 20).map((sub) => (
            <div
              key={sub.id}
              style={s.row}
              onClick={() => navigate(`/challenges/${sub.slug}`)}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--accent-subtle)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span className={`status-${sub.status}`} style={{ fontSize: "16px" }}>
                {sub.status === "accepted" ? "✅" : sub.status === "pending" || sub.status === "running" ? "⏳" : "❌"}
              </span>
              <span style={s.challengeTitle}>{sub.challenge_title}</span>
              <span style={s.lang}>{sub.language}</span>
              {sub.runtime_ms && <span style={s.runtime}>{sub.runtime_ms}ms</span>}
              <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                {new Date(sub.submitted_at).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
