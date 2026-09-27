"use client";

import { useEffect, useState } from "react";
import { getSupabase, adminSignIn } from "@/lib/supabase";
import AdminPanel from "./AdminPanel";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    const { data: listener } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = await adminSignIn(email, password);
      setUser(u);
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] text-zinc-400">
        Loading…
      </div>
    );
  }

  if (user) {
    return <AdminPanel user={user} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-white">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-4 rounded-lg border border-white/10 bg-zinc-900/70 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold">Admin login</h1>
          <p className="mt-1 text-sm text-zinc-400">Restricted area. Authorized account only.</p>
        </div>
        {error && (
          <p className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </p>
        )}
        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-white outline-none focus:border-blue-400"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-white outline-none focus:border-blue-400"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-blue-500 px-6 py-3 font-semibold hover:bg-blue-400 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
