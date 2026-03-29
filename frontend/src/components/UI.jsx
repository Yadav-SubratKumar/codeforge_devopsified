import React from "react";

/* ── Button ──────────────────────────────────────────────────────── */
export function Button({ children, variant = "primary", loading = false, disabled, onClick, style = {}, type = "button" }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px",
    padding: "9px 22px", borderRadius: "var(--radius-sm)",
    fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-ui)",
    cursor: loading || disabled ? "not-allowed" : "pointer",
    border: "none", transition: "all var(--transition)",
    opacity: loading || disabled ? 0.6 : 1,
  };

  const variants = {
    primary:  { background: "var(--accent)", color: "#000" },
    secondary:{ background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border-bright)" },
    danger:   { background: "rgba(255,77,109,0.15)", color: "var(--red)", border: "1px solid rgba(255,77,109,0.3)" },
    ghost:    { background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)" },
  };

  return (
    <button type={type} onClick={onClick} disabled={loading || disabled} style={{ ...base, ...variants[variant], ...style }}>
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}

/* ── Badge ───────────────────────────────────────────────────────── */
export function Badge({ children, type = "easy" }) {
  return <span className={`badge badge-${type}`}>{children}</span>;
}

/* ── Spinner ─────────────────────────────────────────────────────── */
export function Spinner({ size = 24, color = "var(--accent)" }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      border: `${Math.max(2, size / 10)}px solid var(--border)`,
      borderTop: `${Math.max(2, size / 10)}px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
  );
}

/* ── PageSpinner ─────────────────────────────────────────────────── */
export function PageSpinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "5rem", color: "var(--text-muted)", fontSize: "14px" }}>
      <Spinner />
      Loading...
    </div>
  );
}

/* ── EmptyState ──────────────────────────────────────────────────── */
export function EmptyState({ icon = "📭", title = "Nothing here", subtitle = "" }) {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>{icon}</div>
      <div style={{ fontWeight: 700, marginBottom: "6px" }}>{title}</div>
      {subtitle && <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>{subtitle}</div>}
    </div>
  );
}

/* ── ErrorBanner ─────────────────────────────────────────────────── */
export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{
      background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.25)",
      borderRadius: "var(--radius-sm)", padding: "10px 14px",
      color: "var(--red)", fontSize: "13px", marginBottom: "1rem",
    }}>
      {message}
    </div>
  );
}

/* ── Card ────────────────────────────────────────────────────────── */
export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
      border: "1px solid var(--border)", padding: "1.5rem",
      ...style,
    }}>
      {children}
    </div>
  );
}
