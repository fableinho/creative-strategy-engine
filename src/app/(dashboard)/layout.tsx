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
    <div className="min-h-screen">
      <nav className="border-b">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/dashboard" className="font-semibold">
            Creative Strategy Engine
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-gray-500 hover:text-black"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
