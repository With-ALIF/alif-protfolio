"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm({ busy, error, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  return (
    <form onSubmit={(e) => onLogin(e, email, password)} className="w-full max-w-sm space-y-4 rounded-lg border border-white/10 bg-zinc-900/70 p-6">
      <div>
        <h1 className="text-2xl font-bold">Admin login</h1>
        <p className="mt-1 text-sm text-zinc-400">Restricted area. Authorized account only.</p>
      </div>
      {error && <p className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
      <label className="block">
        <span className="text-sm font-medium text-zinc-300">Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-white outline-none focus:border-blue-400" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-300">Password</span>
        <div className="relative mt-2">
          <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required className="w-full rounded-lg border border-white/10 bg-black/30 p-3 pr-12 text-white outline-none focus:border-blue-400" />
          <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>
      <button type="submit" disabled={busy} className="w-full rounded-full bg-blue-500 px-6 py-3 font-semibold hover:bg-blue-400 disabled:opacity-60">
        {busy ? "Signing in…" : "Log in"}
      </button>
      <a href="/" className="block text-center text-sm text-zinc-400 hover:text-white">
        ← Back to home
      </a>
    </form>
  );
}
