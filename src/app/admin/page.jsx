"use client";

import { useEffect, useState } from "react";
import { getSupabase, adminSignIn } from "@/lib/supabase";
import AdminPanel from "./AdminPanel";
import LoginForm from "./components/LoginForm";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setChecking(false);
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      if (data.session?.user) setUser(data.session.user);
      setChecking(false);
    });
    const { data: listener } = sb.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);
  const handleLogin = async (e, email, password) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      setUser(await adminSignIn(email, password));
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  };
  if (checking) return <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] text-zinc-400">Loading…</div>;
  if (user) return <AdminPanel user={user} />;
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-white">
      <LoginForm busy={busy} error={error} onLogin={handleLogin} />
    </div>
  );
}
