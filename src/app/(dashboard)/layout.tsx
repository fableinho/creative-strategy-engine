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
          background: "rgba(250,250,248,.88)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--cse-border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            fontWeight: 600, fontSize: 14, color: "var(--ink)",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 26, height: 26, borderRadius: 7,
              background: "var(--ink)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: 13,
            }}
          >
            ⚡
          </div>
          Creative Strategy Engine
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
