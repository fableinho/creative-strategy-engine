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
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      {/* Left — Brand panel */}
      <div
        style={{
          background: "#111110",
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          padding: 48,
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at 20% 50%, rgba(255,200,100,.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(100,180,255,.06) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <span
            style={{
              fontFamily: "var(--font-hahmlet), serif",
              fontWeight: 300,
              fontSize: 52,
              letterSpacing: "-0.04em",
              color: "#F5F2EC",
              display: "flex",
              alignItems: "center",
              gap: 10,
              lineHeight: 1,
            }}
          >
            flnt
            <svg width="14" height="44" viewBox="0 0 14 44" fill="none" aria-hidden="true">
              <line x1="11" y1="2" x2="3" y2="42" stroke="#C8502A" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </span>
        </div>

        {/* Tagline */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1
            style={{
              fontFamily: "var(--font-hahmlet), serif",
              fontSize: 44, lineHeight: 1.1,
              color: "white", letterSpacing: "-.02em",
              marginBottom: 20,
            }}
          >
            Strike a spark.<br />
            Make it{" "}<em style={{ fontStyle: "italic", color: "rgba(255,255,255,.55)" }}>multiply.</em>
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", lineHeight: 1.6, maxWidth: 320 }}>
            A framework for creative strategists who need more creative sparks, faster.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            "AI-powered messaging angle generation",
            "Full funnel deployment across 22 formats",
            "Exportable creative briefs for production",
          ].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(255,255,255,.55)" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,.3)", flexShrink: 0 }} />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right — Form */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 48, background: "var(--surface)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 380 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: "var(--ink)", marginBottom: 6, letterSpacing: "-.02em" }}>
            Back to work.
          </h2>
          <p style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 32 }}>
            Pick up where you left off.
          </p>

          {error && (
            <div
              style={{
                background: "var(--cse-red-bg)", color: "var(--cse-red)",
                border: "1px solid var(--cse-red-border)",
                padding: "10px 14px", borderRadius: 8,
                fontSize: 13, marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin}>
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="email"
                style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}
              >
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
                  background: "white", border: "1px solid var(--cse-border)",
                  borderRadius: 10, fontSize: 14,
                  fontFamily: "inherit", color: "var(--ink)",
                  outline: "none", boxShadow: "var(--shadow-xs)",
                  boxSizing: "border-box",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "var(--ink)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(17,17,16,.08)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "var(--cse-border)";
                  e.target.style.boxShadow = "var(--shadow-xs)";
                }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="password"
                style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}
              >
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
                  background: "white", border: "1px solid var(--cse-border)",
                  borderRadius: 10, fontSize: 14,
                  fontFamily: "inherit", color: "var(--ink)",
                  outline: "none", boxShadow: "var(--shadow-xs)",
                  boxSizing: "border-box",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "var(--ink)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(17,17,16,.08)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "var(--cse-border)";
                  e.target.style.boxShadow = "var(--shadow-xs)";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "9px 18px",
                background: "var(--ink)", color: "white",
                border: "none", borderRadius: 10,
                fontSize: 14, fontWeight: 500,
                fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                boxShadow: "var(--shadow-xs)",
              }}
            >
              {loading ? "Signing in…" : "Sign in with Email"}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: 12,
              margin: "20px 0", color: "var(--ink-3)", fontSize: 12,
            }}
          >
            <div style={{ flex: 1, height: 1, background: "var(--cse-border)" }} />
            or
            <div style={{ flex: 1, height: 1, background: "var(--cse-border)" }} />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: "100%", padding: "9px 16px", borderRadius: 10,
              border: "1px solid var(--cse-border)", background: "white",
              fontFamily: "inherit", fontSize: 14, fontWeight: 500,
              color: "var(--ink)", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: "var(--shadow-xs)",
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
            <a href="/signup" style={{ color: "var(--ink)", fontWeight: 500, textDecoration: "none" }}>
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
