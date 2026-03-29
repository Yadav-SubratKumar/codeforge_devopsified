import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const s = {
  page: { minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" },
  card: { width: "100%", maxWidth: "420px", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", padding: "2.5rem" },
  title: { fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" },
  sub: { color: "var(--text-secondary)", fontSize: "14px", marginBottom: "2rem" },
  field: { marginBottom: "1rem" },
  label: { display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", letterSpacing: "0.04em" },
  input: { width: "100%", padding: "10px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border-bright)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "14px", fontFamily: "var(--font-ui)", outline: "none", boxSizing: "border-box" },
  hint: { fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" },
  error: { background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: "var(--radius-sm)", padding: "10px 14px", color: "var(--red)", fontSize: "13px", marginBottom: "1rem" },
  btn: (loading) => ({ width: "100%", padding: "12px", borderRadius: "var(--radius-sm)", background: loading ? "var(--bg-elevated)" : "var(--accent)", color: loading ? "var(--text-muted)" : "#000", border: "none", fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-ui)", marginTop: "0.5rem" }),
  footer: { textAlign: "center", marginTop: "1.5rem", fontSize: "13px", color: "var(--text-secondary)" },
  link: { color: "var(--accent)", fontWeight: 600 },
};

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate("/challenges");
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || "Registration failed.";
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.card} className="fade-in">
        <div style={s.title}>Create account</div>
        <div style={s.sub}>Join CodeForge and start solving</div>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handle}>
          <div style={s.field}>
            <label style={s.label}>USERNAME</label>
            <input style={s.input} type="text" value={form.username} required
              onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <div style={s.hint}>3–50 characters, alphanumeric only</div>
          </div>
          <div style={s.field}>
            <label style={s.label}>EMAIL</label>
            <input style={s.input} type="email" value={form.email} required
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div style={s.field}>
            <label style={s.label}>PASSWORD</label>
            <input style={s.input} type="password" value={form.password} required
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <div style={s.hint}>Min 8 chars, must include a letter and a number</div>
          </div>
          <button type="submit" style={s.btn(loading)} disabled={loading}>
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>
        <div style={s.footer}>
          Already have an account? <Link to="/login" style={s.link}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
