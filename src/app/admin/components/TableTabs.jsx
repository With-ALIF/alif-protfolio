"use client";

export default function TableTabs({ tables, activeName, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tables.map((t) => (
        <button
          key={t.name}
          onClick={() => onChange(t.name)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            t.name === activeName ? "bg-blue-500 text-white" : "border border-white/10 text-zinc-300 hover:bg-white/10"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
