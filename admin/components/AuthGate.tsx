"use client"

import { useEffect, useRef, useState } from "react"

const SESSION_KEY      = "admin_auth"
const SESSION_TIME_KEY = "admin_auth_time"
const SESSION_DURATION = 1000 * 60 * 60 // 1 hour

const ssGet    = (k: string) => { try { return sessionStorage.getItem(k) }         catch { return null } }
const ssSet    = (k: string, v: string) => { try { sessionStorage.setItem(k, v) }  catch {} }
const ssRemove = (k: string) => { try { sessionStorage.removeItem(k) }             catch {} }

export function clearAdminSession() {
  ssRemove(SESSION_KEY)
  ssRemove(SESSION_TIME_KEY)
}

const GLOBAL_STYLES = `
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes shake {
    0%,100% { transform: translateX(0) }
    20%      { transform: translateX(-8px) }
    40%      { transform: translateX( 8px) }
    60%      { transform: translateX(-5px) }
    80%      { transform: translateX( 5px) }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px) }
    to   { opacity: 1; transform: translateY(0) }
  }
  .auth-input:focus { border-color: #111827 !important; box-shadow: 0 0 0 3px rgba(17,24,39,0.1) !important; }
  .auth-btn:hover:not(:disabled) { background: #374151 !important; }
  .mode-toggle:hover { color: #111827 !important; text-decoration: underline; }
`

export default function AuthGate({ children }: { children: React.ReactNode }) {
  // New state to manage mode
  const [mode, setMode]                   = useState<"login" | "signup">("login")
  const [input, setInput]                 = useState("")
  const [confirmInput, setConfirmInput]   = useState("") // Only for signup
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [error, setError]                 = useState("")
  const [shake, setShake]                 = useState(false)
  const [loading, setLoading]             = useState(false)
  const inputRef                          = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = ssGet(SESSION_KEY)
    const time  = ssGet(SESSION_TIME_KEY)

    if (saved === "true" && time && Date.now() - Number(time) < SESSION_DURATION) {
      setAuthenticated(true)
    } else {
      clearAdminSession()
      setAuthenticated(false)
    }
  }, [])

  useEffect(() => {
    if (authenticated === false) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [authenticated, mode])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleSubmit = async () => {
    const trimmed = input.trim()
    if (!trimmed) {
      setError("Password is required.")
      triggerShake()
      return
    }

    if (mode === "signup" && trimmed !== confirmInput) {
      setError("Passwords do not match.")
      triggerShake()
      return
    }

    setLoading(true)
    setError("")

    // Simulating a network delay
    await new Promise(r => setTimeout(r, 600))

    if (mode === "login") {
      // LOGIN LOGIC
      if (trimmed === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
        ssSet(SESSION_KEY, "true")
        ssSet(SESSION_TIME_KEY, Date.now().toString())
        setAuthenticated(true)
      } else {
        setError("Incorrect password.")
        triggerShake()
      }
    } else {
      // SIGNUP LOGIC (Placeholder for your API call)
      console.log("Account created with password:", trimmed)
      alert("Sign up successful! Please log in.")
      setMode("login")
      setInput("")
      setConfirmInput("")
    }

    setLoading(false)
  }

  const styleTag = <style>{GLOBAL_STYLES}</style>

  if (authenticated === null) {
    return (
      <div style={styles.centered}>
        {styleTag}
        <div style={styles.spinner} />
      </div>
    )
  }

  if (!authenticated) {
    return (
      <>
        {styleTag}
        <div style={styles.page}>
          <div style={{
            ...styles.card,
            animation: shake ? "shake 0.5s ease" : "fadeIn 0.35s ease",
          }}>
            <div style={styles.logoWrap}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>

            <div style={{ textAlign: "center" }}>
              <h2 style={styles.title}>{mode === "login" ? "Admin Login" : "Create Account"}</h2>
              <p style={styles.subtitle}>ACPremiumAuto Dashboard</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                ref={inputRef}
                className="auth-input"
                type="password"
                placeholder={mode === "login" ? "Enter password" : "New password"}
                value={input}
                onChange={e => { setInput(e.target.value); setError("") }}
                onKeyDown={e => { if (e.key === "Enter") handleSubmit() }}
                disabled={loading}
                style={{ ...styles.input, borderColor: error ? "#ef4444" : "#e5e7eb" }}
              />

              {mode === "signup" && (
                <input
                  className="auth-input"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmInput}
                  onChange={e => { setConfirmInput(e.target.value); setError("") }}
                  onKeyDown={e => { if (e.key === "Enter") handleSubmit() }}
                  disabled={loading}
                  style={{ ...styles.input, animation: "fadeIn 0.3s ease" }}
                />
              )}
            </div>

            <div style={{ minHeight: 18 }}>
              {error && (
                <p style={styles.errorMsg}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </p>
              )}
            </div>

            <button
              className="auth-btn"
              onClick={handleSubmit}
              disabled={loading}
              style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <span style={styles.btnSpinner} /> : (mode === "login" ? "Login" : "Sign Up")}
            </button>

            <button 
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
              style={styles.toggleBtn}
              className="mode-toggle"
            >
              {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </>
    )
  }

  return <>{children}</>
}

const styles = {
  // Existing styles kept for consistency
  centered: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" } as React.CSSProperties,
  spinner: { width: 28, height: 28, border: "3px solid #e5e7eb", borderTop: "3px solid #111827", borderRadius: "50%", animation: "spin 0.8s linear infinite" } as React.CSSProperties,
  page: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f6fa" } as React.CSSProperties,
  card: { width: 340, background: "#fff", padding: "32px 28px 20px", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.10)", display: "flex", flexDirection: "column", gap: 16 } as React.CSSProperties,
  logoWrap: { width: 52, height: 52, background: "#f3f4f6", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "center" } as React.CSSProperties,
  title: { margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" } as React.CSSProperties,
  subtitle: { fontSize: 13, color: "#9ca3af", marginTop: 3 } as React.CSSProperties,
  input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" } as React.CSSProperties,
  errorMsg: { margin: 0, fontSize: 12, color: "#ef4444", display: "flex", alignItems: "center", gap: 5 } as React.CSSProperties,
  button: { padding: "11px", background: "#111827", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", height: 42, display: "flex", alignItems: "center", justifyContent: "center" } as React.CSSProperties,
  btnSpinner: { width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" } as React.CSSProperties,
  toggleBtn: { background: "none", border: "none", color: "#6b7280", fontSize: 12, cursor: "pointer", marginTop: 8, transition: "color 0.2s" } as React.CSSProperties,
}