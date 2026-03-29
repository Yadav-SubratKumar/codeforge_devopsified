import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const s = {
  page: { maxWidth: "960px", margin: "0 auto", padding: "2.5rem 1.5rem" },
  header: { marginBottom: "2rem" },
  title: { fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" },
  subtitle: { color: "var(--text-secondary)", fontSize: "14px" },
  filters: { display: "flex", gap: "8px", marginBottom: "1.5rem", flexWrap: "wrap" },
  filterBtn: (active) => ({
    padding: "6px 16px", borderRadius: "20px", cursor: "pointer",
    fontSize: "12px", fontWeight: 600, fontFamily: "var(--font-mono)",
    border: "1px solid", transition: "all var(--transition)",
    background: active ? "var(--accent)" : "transparent",
    borderColor: active ? "var(--accent)" : "var(--border-bright)",
    color: active ? "#000" : "var(--text-secondary)",
  }),
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "10px 16px", textAlign: "left",
    fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
    textTransform: "uppercase", color: "var(--text-muted)",
    borderBottom: "1px solid var(--border)",
  },
  tr: (i) => ({
    background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
    cursor: "pointer", transition: "background var(--transition)",
  }),
  td: { padding: "14px 16px", fontSize: "14px", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  titleCell: { fontWeight: 600, color: "var(--text-primary)" },
  cat: {
    fontSize: "11px", fontFamily: "var(--font-mono)",
    color: "var(--text-muted)", marginTop: "2px",
  },
  pts: { fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 700, fontSize: "13px" },
  empty: { textAlign: "center", padding: "4rem", color: "var(--text-muted)" },
  spinner: {
    width: 32, height: 32, margin: "4rem auto",
    border: "3px solid var(--border)",
    borderTop: "3px solid var(--accent)",
    borderRadius: "50%",
  },
};

const DIFFICULTIES = ["all", "easy", "medium", "hard"];

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diff, setDiff] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = diff !== "all" ? { difficulty: diff } : {};
        const { data } = await api.get("/challenges", { params });
        setChallenges(data.challenges || []);
      } catch {
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [diff]);

  return (
    <div style={s.page} className="fade-in">
      <div style={s.header}>
        <h1 style={s.title}>Challenges</h1>
        <p style={s.subtitle}>Pick a problem, open the editor, and submit your solution.</p>
      </div>

      <div style={s.filters}>
        {DIFFICULTIES.map((d) => (
          <button key={d} style={s.filterBtn(diff === d)} onClick={() => setDiff(d)}>
            {d === "all" ? "All" : d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={s.spinner} className="spin" />
      ) : challenges.length === 0 ? (
        <div style={s.empty}>No challenges found.</div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>#</th>
              <th style={s.th}>Title</th>
              <th style={s.th}>Difficulty</th>
              <th style={s.th}>Points</th>
            </tr>
          </thead>
          <tbody>
            {challenges.map((c, i) => (
              <tr
                key={c.id}
                style={s.tr(i)}
                onClick={() => navigate(`/challenges/${c.slug}`)}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--accent-subtle)"}
                onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"}
              >
                <td style={{ ...s.td, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{i + 1}</td>
                <td style={s.td}>
                  <div style={s.titleCell}>{c.title}</div>
                  <div style={s.cat}>{c.category}</div>
                </td>
                <td style={s.td}>
                  <span className={`badge badge-${c.difficulty}`}>{c.difficulty}</span>
                </td>
                <td style={s.td}>
                  <span style={s.pts}>+{c.points}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
