import { createClient } from "./client";

// Redirect URLs for auth flows
export function getAuthRedirectURL(path: string = "/auth/callback") {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000";

  // Ensure no trailing slash on base, and path starts with /
  const url = baseUrl.replace(/\/$/, "") + path;
  return url;
}

// Email/password sign up
export async function signUpWithEmail(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectURL("/auth/confirm"),
    },
  });
}

// Email/password sign in
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

// Google OAuth sign in
export async function signInWithGoogle() {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthRedirectURL("/auth/callback"),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
}

// Sign out
export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}
