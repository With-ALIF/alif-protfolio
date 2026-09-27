// Browser-side Supabase client (public reads + admin auth session).
import { createClient } from "@supabase/supabase-js";

export const ADMIN_EMAIL = "alifbrur16@gmail.com";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient = null;

export function getSupabase() {
  if (!URL || !ANON_KEY) return null;
  if (!browserClient) {
    browserClient = createClient(URL, ANON_KEY);
  }
  return browserClient;
}

export async function adminSignIn(email, password) {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase is not configured.");
  if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
    throw new Error("This account is not authorized.");
  }
  const { data, error } = await sb.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  if (data.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    await sb.auth.signOut();
    throw new Error("This account is not authorized.");
  }
  return data.user;
}

export async function adminSignOut() {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
}
