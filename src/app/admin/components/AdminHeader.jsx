"use client";

import { adminSignOut, ADMIN_EMAIL } from "@/lib/supabase";

export default function AdminHeader({ user }) {
  const handleLogout = async () => {
    await adminSignOut();
    window.location.assign("/");
  };
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-[#090b10]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Portfolio CMS</p>
          <p className="hidden truncate text-xs text-zinc-500 sm:block">
            {user?.email} · {ADMIN_EMAIL === user?.email ? "admin" : "unknown"}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <a href="/" className="rounded-full border border-white/15 px-3 py-2 text-xs sm:px-4 sm:text-sm hover:bg-white/10">
            View site
          </a>
          <button onClick={handleLogout} className="rounded-full border border-white/15 px-3 py-2 text-xs sm:px-4 sm:text-sm hover:bg-white/10">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
