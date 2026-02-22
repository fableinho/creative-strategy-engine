import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      {/* Fixed aurora orb background layer */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div
          className="orb orb-violet"
          style={{ width: 700, height: 700, top: -200, left: -250, animation: "float 14s ease-in-out infinite" }}
        />
        <div
          className="orb orb-pink"
          style={{ width: 500, height: 500, top: 150, right: -200, animation: "float 18s ease-in-out infinite 3s" }}
        />
        <div
          className="orb orb-cyan"
          style={{ width: 350, height: 350, bottom: -50, left: "35%", animation: "float 12s ease-in-out infinite 1.5s" }}
        />
        {/* Subtle grid overlay */}
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Floating nav */}
      <div
        style={{
          position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)",
          zIndex: 100, width: "calc(100% - 48px)", maxWidth: 1280,
        }}
      >
        <nav
          className="glass"
          style={{
            borderRadius: 16,
            height: 52,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 20px",
          }}
        >
          <Link
            href="/dashboard"
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
          >
            {/* Logo icon */}
            <div
              className="btn-neon"
              style={{
                width: 28, height: 28, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "var(--font-syne), sans-serif",
                fontWeight: 700, fontSize: 18,
                letterSpacing: "-0.02em", color: "var(--ink)", lineHeight: 1,
              }}
            >
              flnt
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{user.email}</span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="nav-signout-btn">
                Sign out
              </button>
            </form>
          </div>
        </nav>
      </div>

      {/* Page content — above aurora layer */}
      <div style={{ position: "relative", zIndex: 1, paddingTop: 76 }}>
        {children}
      </div>
    </div>
  );
}
