import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const s = {
  page: { minHeight: "calc(100vh - 60px)", display: "flex", flexDirection: "column" },
  hero: {
    flex: 1,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    textAlign: "center", padding: "5rem 2rem",
    position: "relative", overflow: "hidden",
  },
  grid: {
    position: "absolute", inset: 0, zIndex: 0,
    backgroundImage: `
      linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
  },
  gradientOrb: {
    position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
    width: "600px", height: "300px",
    background: "radial-gradient(ellipse, rgba(0,255,136,0.06) 0%, transparent 70%)",
    zIndex: 0,
  },
  content: { position: "relative", zIndex: 1, maxWidth: "700px" },
  eyebrow: {
    display: "inline-flex", alignItems: "center", gap: "8px",
    padding: "4px 14px", borderRadius: "20px",
    border: "1px solid var(--border-bright)",
    background: "var(--bg-elevated)",
    fontSize: "11px", fontFamily: "var(--font-mono)",
    color: "var(--accent)", letterSpacing: "0.08em",
    marginBottom: "1.5rem",
  },
  dot: { width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "pulse 1.5s ease infinite" },
  h1: {
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
    fontWeight: 800, lineHeight: 1.05,
    letterSpacing: "-0.03em",
    marginBottom: "1.2rem",
  },
  accent: { color: "var(--accent)" },
  sub: {
    fontSize: "1.05rem", color: "var(--text-secondary)",
    maxWidth: "520px", margin: "0 auto 2.5rem",
    lineHeight: 1.7,
  },
  btnRow: { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" },
  btnPrimary: {
    padding: "12px 32px", borderRadius: "var(--radius-md)",
    background: "var(--accent)", color: "#000", border: "none",
    fontSize: "14px", fontWeight: 700, cursor: "pointer",
    transition: "all var(--transition)",
    fontFamily: "var(--font-ui)",
  },
  btnSecondary: {
    padding: "12px 32px", borderRadius: "var(--radius-md)",
    background: "transparent", color: "var(--text-primary)",
    border: "1px solid var(--border-bright)",
    fontSize: "14px", fontWeight: 600, cursor: "pointer",
    transition: "all var(--transition)",
    fontFamily: "var(--font-ui)",
  },
  stats: {
    display: "flex", justifyContent: "center", gap: "3rem",
    padding: "2rem", borderTop: "1px solid var(--border)",
    background: "var(--bg-surface)",
  },
  stat: { textAlign: "center" },
  statNum: { fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent)" },
  statLabel: { fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" },

  features: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1px", background: "var(--border)",
  },
  feat: {
    padding: "2rem", background: "var(--bg-surface)",
    display: "flex", flexDirection: "column", gap: "10px",
  },
  featIcon: { fontSize: "1.5rem" },
  featTitle: { fontWeight: 700, fontSize: "15px" },
  featDesc: { color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.6 },
};

const FEATURES = [
  { icon: "⚡", title: "Monaco Editor", desc: "VS Code-grade editing experience with syntax highlighting and autocomplete." },
  { icon: "🔒", title: "Secure Sandbox", desc: "Code runs in an isolated environment — no system access, no tricks." },
  { icon: "📊", title: "Redis Cache", desc: "Lightning-fast challenge delivery and session management via Redis." },
  { icon: "🗄️", title: "PostgreSQL Backend", desc: "Persistent user data, submissions, and leaderboard — fully relational." },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuth } = useAuth();

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={s.grid} />
        <div style={s.gradientOrb} />
        <div style={s.content} className="fade-in">
          <div style={s.eyebrow}><div style={s.dot} /> DEVSECOPS READY PLATFORM</div>
          <h1 style={s.h1}>
            Forge your skills.<br />
            <span style={s.accent}>Ship better code.</span>
          </h1>
          <p style={s.sub}>
            A multi-tier coding platform built for DevSecOps pipelines. Solve challenges, track progress, and scale confidently.
          </p>
          <div style={s.btnRow}>
            <button style={s.btnPrimary} onClick={() => navigate("/challenges")}>
              Browse Challenges →
            </button>
            {!isAuth && (
              <button style={s.btnSecondary} onClick={() => navigate("/register")}>
                Create Account
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={s.features}>
        {FEATURES.map((f) => (
          <div key={f.title} style={s.feat}>
            <div style={s.featIcon}>{f.icon}</div>
            <div style={s.featTitle}>{f.title}</div>
            <div style={s.featDesc}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={s.stats}>
        {[["100+", "Challenges"], ["4", "Service Tiers"], ["5+", "Languages"], ["∞", "Submissions"]].map(([n, l]) => (
          <div key={l} style={s.stat}>
            <div style={s.statNum}>{n}</div>
            <div style={s.statLabel}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
