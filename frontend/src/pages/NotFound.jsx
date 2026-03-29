import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: "calc(100vh - 60px)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", gap: "1rem", padding: "2rem",
    }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "5rem", fontWeight: 800, color: "var(--accent)", lineHeight: 1 }}>
        404
      </div>
      <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>Page not found</div>
      <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
        The page you're looking for doesn't exist or has been moved.
      </div>
      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "0.5rem", padding: "10px 28px",
          background: "var(--accent)", color: "#000", border: "none",
          borderRadius: "var(--radius-sm)", fontWeight: 700,
          fontSize: "14px", cursor: "pointer", fontFamily: "var(--font-ui)",
        }}
      >
        ← Back to Home
      </button>
    </div>
  );
}
