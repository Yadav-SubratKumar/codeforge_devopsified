import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import api from "../api";

const LANGUAGES = ["javascript", "python", "java", "cpp", "go"];

const TEMPLATES = {
  javascript: "// Write your solution here\nfunction solution() {\n  \n}\n",
  python:     "# Write your solution here\ndef solution():\n    pass\n",
  java:       "// Write your solution here\npublic class Solution {\n    public static void main(String[] args) {\n        \n    }\n}\n",
  cpp:        "// Write your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n",
  go:         "// Write your solution here\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n    \n}\n",
};

const MONACO_LANG = { javascript: "javascript", python: "python", java: "java", cpp: "cpp", go: "go" };

const s = {
  layout: { display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" },

  // Left panel
  left: { width: "420px", minWidth: "320px", display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", background: "var(--bg-surface)" },
  problemHeader: { padding: "1.5rem", borderBottom: "1px solid var(--border)" },
  problemTitle: { fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.01em", marginBottom: "8px" },
  metaRow: { display: "flex", gap: "10px", alignItems: "center" },
  problemBody: { padding: "1.5rem", overflowY: "auto", flex: 1 },
  section: { marginBottom: "1.5rem" },
  sectionTitle: { fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "10px" },
  desc: { color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.7 },
  exampleBox: {
    background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)", padding: "12px 14px",
    fontFamily: "var(--font-mono)", fontSize: "12px",
    marginBottom: "10px", lineHeight: 1.6,
  },
  label: { color: "var(--text-muted)", marginRight: "6px" },

  // Right panel
  right: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  editorBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 1rem", height: "48px",
    borderBottom: "1px solid var(--border)", background: "var(--bg-card)",
  },
  langSelect: {
    background: "var(--bg-elevated)", color: "var(--text-primary)",
    border: "1px solid var(--border-bright)", borderRadius: "var(--radius-sm)",
    padding: "5px 10px", fontSize: "12px", fontFamily: "var(--font-mono)",
    cursor: "pointer",
  },
  editorWrap: { flex: 1, overflow: "hidden" },
  resultsPanel: {
    height: "200px", borderTop: "1px solid var(--border)",
    background: "var(--bg-card)", overflowY: "auto",
    padding: "1rem",
  },
  resultTitle: { fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "10px" },
  resultRow: { display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", fontFamily: "var(--font-mono)", marginBottom: "6px" },

  submitBtn: (loading) => ({
    padding: "7px 22px", borderRadius: "var(--radius-sm)",
    background: loading ? "var(--bg-elevated)" : "var(--accent)",
    color: loading ? "var(--text-muted)" : "#000",
    border: "none", fontWeight: 700, fontSize: "13px",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "all var(--transition)",
    fontFamily: "var(--font-ui)",
  }),

  spinner: { display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", color: "var(--text-muted)", gap: "10px" },
};

export default function EditorPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    api.get(`/challenges/${slug}`)
      .then(({ data }) => {
        setChallenge(data);
        setCode(data.template_code || TEMPLATES.javascript);
      })
      .catch(() => navigate("/challenges"));
  }, [slug, navigate]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(TEMPLATES[lang]);
  };

  const handleSubmit = async () => {
    if (!challenge || submitting) return;
    setSubmitting(true);
    setResult({ status: "pending" });
    try {
      const { data } = await api.post("/submissions", {
        challenge_id: challenge.id, language, code,
      });
      pollResult(data.submissionId);
    } catch (err) {
      setResult({ status: "error", message: err.response?.data?.error || "Submission failed" });
      setSubmitting(false);
    }
  };

  const pollResult = (id) => {
    setPolling(true);
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const { data } = await api.get(`/submissions/${id}`);
        if (data.status !== "pending" && data.status !== "running") {
          clearInterval(pollRef.current);
          setResult(data);
          setPolling(false);
          setSubmitting(false);
        }
      } catch { clearInterval(pollRef.current); setPolling(false); setSubmitting(false); }
      if (attempts > 20) { clearInterval(pollRef.current); setPolling(false); setSubmitting(false); }
    }, 1000);
  };

  useEffect(() => () => clearInterval(pollRef.current), []);

  if (!challenge) return (
    <div style={s.spinner}>
      <div style={{ width: 20, height: 20, border: "2px solid var(--border)", borderTop: "2px solid var(--accent)", borderRadius: "50%" }} className="spin" />
      Loading challenge...
    </div>
  );

  return (
    <div style={s.layout}>
      {/* ── Left: Problem Description ── */}
      <div style={s.left}>
        <div style={s.problemHeader}>
          <div style={s.problemTitle}>{challenge.title}</div>
          <div style={s.metaRow}>
            <span className={`badge badge-${challenge.difficulty}`}>{challenge.difficulty}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>{challenge.category}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)", marginLeft: "auto" }}>+{challenge.points} pts</span>
          </div>
        </div>
        <div style={s.problemBody}>
          <div style={s.section}>
            <div style={s.sectionTitle}>Description</div>
            <div style={s.desc}>{challenge.description}</div>
          </div>

          {challenge.examples?.length > 0 && (
            <div style={s.section}>
              <div style={s.sectionTitle}>Examples</div>
              {challenge.examples.map((ex, i) => (
                <div key={i} style={s.exampleBox}>
                  <div><span style={s.label}>Input:</span>{ex.input}</div>
                  <div><span style={s.label}>Output:</span>{ex.output}</div>
                  {ex.explanation && <div style={{ color: "var(--text-muted)", marginTop: "4px" }}>{ex.explanation}</div>}
                </div>
              ))}
            </div>
          )}

          {challenge.constraints && (
            <div style={s.section}>
              <div style={s.sectionTitle}>Constraints</div>
              <div style={s.desc}>{challenge.constraints}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Editor + Results ── */}
      <div style={s.right}>
        <div style={s.editorBar}>
          <select
            style={s.langSelect}
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <button style={s.submitBtn(submitting)} onClick={handleSubmit} disabled={submitting}>
            {submitting ? (polling ? "⏳ Judging..." : "Submitting...") : "▶ Submit"}
          </button>
        </div>

        <div style={s.editorWrap}>
          <Editor
            height="100%"
            language={MONACO_LANG[language]}
            value={code}
            onChange={(v) => setCode(v || "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              padding: { top: 12 },
              renderLineHighlight: "gutter",
              tabSize: 2,
            }}
          />
        </div>

        <div style={s.resultsPanel}>
          <div style={s.resultTitle}>Results</div>
          {!result && <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Submit your code to see results.</div>}
          {result && (
            <div className="fade-in">
              <div style={s.resultRow}>
                <span style={{ color: "var(--text-secondary)" }}>Status:</span>
                <span className={`status-${result.status}`} style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "12px" }}>
                  {result.status === "pending" || result.status === "running" ? "⏳ " : result.status === "accepted" ? "✅ " : "❌ "}
                  {result.status?.replace(/_/g, " ")}
                </span>
              </div>
              {result.runtime_ms && (
                <div style={s.resultRow}>
                  <span style={{ color: "var(--text-secondary)" }}>Runtime:</span>
                  <span>{result.runtime_ms} ms</span>
                </div>
              )}
              {result.test_results?.map((t, i) => (
                <div key={i} style={{ ...s.resultRow, fontSize: "12px" }}>
                  <span>{t.passed ? "✅" : "❌"}</span>
                  <span style={{ color: "var(--text-muted)" }}>Test {t.test}:</span>
                  <span>{t.passed ? "Passed" : `Expected ${t.expected}, got ${t.actual}`}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
