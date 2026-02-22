"use client";

import { useState } from "react";
import { signInWithEmail, signInWithGoogle } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signInWithEmail(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);

    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Aurora orbs */}
      <div className="orb orb-violet" style={{ width: 600, height: 600, top: -200, left: -200, animation: "float 14s ease-in-out infinite" }} />
      <div className="orb orb-pink" style={{ width: 400, height: 400, bottom: -100, right: -100, animation: "float 18s ease-in-out infinite 3s" }} />
      <div className="orb orb-cyan" style={{ width: 250, height: 250, top: "30%", right: "20%", animation: "float 10s ease-in-out infinite 1s" }} />

      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        pointerEvents: "none",
      }} />

      {/* Auth card */}
      <div
        className="glass-strong"
        style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: 420,
          borderRadius: 24, padding: 40,
          margin: "0 24px",
          animation: "fadeUp 0.6s ease forwards",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div
            className="btn-neon"
            style={{
              width: 32, height: 32, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <span style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontWeight: 700, fontSize: 20,
            letterSpacing: "-0.02em", color: "var(--ink)",
          }}>
            flnt
          </span>
        </div>

        <h2 style={{
          fontFamily: "var(--font-syne), sans-serif",
          fontSize: 26, fontWeight: 700,
          letterSpacing: "-.02em", color: "var(--ink)",
          marginBottom: 6,
        }}>
          Back to work.
        </h2>
        <p style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 28 }}>
          Pick up where you left off.
        </p>

        {error && (
          <div style={{
            background: "var(--cse-red-bg)", color: "var(--cse-red)",
            border: "1px solid var(--cse-red-border)",
            padding: "10px 14px", borderRadius: 10,
            fontSize: 13, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="email" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@agency.com"
              style={{
                width: "100%", padding: "9px 12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 10, fontSize: 14,
                fontFamily: "inherit", color: "var(--ink)",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={e => {
                e.target.style.borderColor = "rgba(139,92,246,0.5)";
                e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "rgba(255,255,255,0.10)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="password" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%", padding: "9px 12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 10, fontSize: 14,
                fontFamily: "inherit", color: "var(--ink)",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={e => {
                e.target.style.borderColor = "rgba(139,92,246,0.5)";
                e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "rgba(255,255,255,0.10)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-neon"
            style={{
              width: "100%", padding: "10px 18px",
              color: "white", borderRadius: 10,
              fontSize: 14, fontWeight: 500, fontFamily: "inherit",
            }}
          >
            {loading ? "Signing in…" : "Sign in with Email"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0", color: "var(--ink-3)", fontSize: 12 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          or
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "9px 16px", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.06)",
            fontFamily: "inherit", fontSize: 14, fontWeight: 500,
            color: "var(--ink)", cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "background 0.15s, border-color 0.15s",
            opacity: loading ? 0.6 : 1,
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.10)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.16)";
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.10)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>

        <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--ink-2)" }}>
          Don&apos;t have an account?{" "}
          <a href="/signup" style={{ color: "#A78BFA", fontWeight: 500, textDecoration: "none" }}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
