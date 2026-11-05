"use client";

import CountUp from "./CountUp";

export default function ProjectStatistics({ entries }) {
  if (!Array.isArray(entries) || entries.length === 0) return null;

  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {entries.map(([label, value]) => (
        <div
          key={label}
          className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-center"
        >
          <p className="text-2xl font-bold tabular-nums text-blue-200">
            <CountUp value={value} />
          </p>
          <p className="mt-1 text-sm text-zinc-400">{label}</p>
        </div>
      ))}
    </section>
  );
}
