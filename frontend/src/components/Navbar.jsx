import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const styles = {
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(10,10,15,0.9)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--border)",
    padding: "0 2rem",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    height: "60px",
  },
  logo: {
    fontFamily: "var(--font-mono)",
    fontSize: "1.1rem", fontWeight: 700,
    color: "var(--accent)",
    display: "flex", alignItems: "center", gap: "8px",
    letterSpacing: "-0.02em",
  },
  logoIcon: {
    width: 28, height: 28,
    background: "var(--accent)",
    borderRadius: "6px",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#000", fontSize: "14px", fontWeight: 800,
  },
  links: { display: "flex", alignItems: "center", gap: "4px" },
  link: (active) => ({
    padding: "6px 14px", borderRadius: "var(--radius-sm)",
    fontSize: "13px", fontWeight: 600,
    color: active ? "var(--accent)" : "var(--text-secondary)",
    background: active ? "var(--accent-subtle)" : "transparent",
    transition: "all var(--transition)",
    cursor: "pointer",
  }),
  right: { display: "flex", alignItems: "center", gap: "10px" },
  userBadge: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "5px 12px",
    background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)", fontSize: "13px",
  },
  pts: { color: "var(--accent)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "12px" },
  btnOutline: {
    padding: "6px 16px", borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border-bright)",
    background: "transparent", color: "var(--text-secondary)",
    fontSize: "13px", fontWeight: 600, cursor: "pointer",
    transition: "all var(--transition)",
  },
  btnAccent: {
    padding: "6px 16px", borderRadius: "var(--radius-sm)",
    border: "none",
    background: "var(--accent)", color: "#000",
    fontSize: "13px", fontWeight: 700, cursor: "pointer",
    transition: "all var(--transition)",
  },
};

export default function Navbar() {
  const { user, isAuth, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/challenges", label: "Challenges" },
    { to: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        <div style={styles.logoIcon}>&lt;/&gt;</div>
        CodeForge
      </Link>

      <div style={styles.links}>
        {navLinks.map(({ to, label }) => (
          <Link key={to} to={to} style={styles.link(location.pathname === to)}>
            {label}
          </Link>
        ))}
      </div>

      <div style={styles.right}>
        {isAuth ? (
          <>
            <div
              style={{ ...styles.userBadge, cursor: "pointer" }}
              onClick={() => navigate("/profile")}
              title="View profile"
            >
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{user.username}</span>
              <span style={styles.pts}>⚡ {user.points ?? 0} pts</span>
            </div>
            <button style={styles.btnOutline} onClick={() => { logout(); navigate("/"); }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button style={styles.btnOutline} onClick={() => navigate("/login")}>Log In</button>
            <button style={styles.btnAccent} onClick={() => navigate("/register")}>Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
}
