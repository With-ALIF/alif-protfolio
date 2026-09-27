"use client";

import Link from "next/link";

export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-white">
      <div className="w-full max-w-sm space-y-4 rounded-lg border border-white/10 bg-zinc-900/70 p-6 text-center">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="text-sm text-zinc-400">{error?.message || "Unexpected error."}</p>
        <button onClick={reset} className="w-full rounded-full bg-blue-500 px-6 py-2 font-semibold hover:bg-blue-400">
          Try again
        </button>
        <Link href="/" className="block text-sm text-zinc-400 hover:text-white">
          Back to home
        </Link>
      </div>
    </div>
  );
}
