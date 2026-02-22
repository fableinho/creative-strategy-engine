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
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          height: 52,
          background: "rgba(245,242,236,.90)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--cse-border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        <Link
          href="/dashboard"
          style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
        >
          <span
            style={{
              fontFamily: "var(--font-hahmlet), serif",
              fontWeight: 300,
              fontSize: 22,
              letterSpacing: "-0.04em",
              color: "var(--ink)",
              display: "flex",
              alignItems: "center",
              gap: 5,
              lineHeight: 1,
            }}
          >
            flnt
            <svg width="6" height="18" viewBox="0 0 6 18" fill="none" aria-hidden="true">
              <line x1="4.5" y1="1" x2="1.5" y2="17" stroke="#C8502A" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{user.email}</span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="nav-signout-btn"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>
      <div style={{ paddingTop: 52 }}>
        {children}
      </div>
    </div>
  );
}
