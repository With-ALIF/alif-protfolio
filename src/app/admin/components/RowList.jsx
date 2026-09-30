"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

export function StatusBanner({ error, notice }) {
  return (
    <>
      {error && <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
      {notice && <p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{notice}</p>}
    </>
  );
}

// Which row values a query is matched against.
function haystack(table, row) {
  return [table.listBy(row), row.name, row.title, row.slug, row.icon, row.description, row.website, row.url]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function RowList({ table, rows, loading, editing, onEdit, onDelete, onNew, canDelete, showAdd = true, showDelete = true }) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () => (table.searchable && q ? rows.filter((row) => haystack(table, row).includes(q)) : rows),
    [table, rows, q]
  );

  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">
          {table.label} ({q && table.searchable ? `${visible.length}/${rows.length}` : rows.length})
        </h2>
        {showAdd ? (
          <button onClick={onNew} className="rounded-full bg-blue-500 px-4 py-1.5 text-sm font-semibold hover:bg-blue-400">
            + Add
          </button>
        ) : null}
      </div>
      {table.searchable ? (
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${table.label.toLowerCase()}…`}
            className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-9 pr-9 text-sm text-white outline-none focus:border-blue-400"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              title="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}
      {loading ? (
        <p className="text-sm text-zinc-400">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-zinc-400">{q && table.searchable ? `No ${table.label.toLowerCase()} match “${query.trim()}”.` : "No rows yet."}</p>
      ) : (
        <ul className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {visible.map((row) => {
            const thumb = table.thumb?.(row);
            return (
              <li
                key={row.id}
                className={`flex items-center justify-between gap-2 rounded-lg border p-3 text-sm ${
                  editing?.id === row.id ? "border-blue-400/50 bg-blue-500/10" : "border-white/10 bg-black/20"
                }`}
              >
                <button onClick={() => onEdit(row)} className="flex min-w-0 flex-1 items-center gap-3 text-left leading-6 hover:text-white">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" className="h-7 w-7 shrink-0 rounded object-contain" />
                  ) : null}
                  <span className="min-w-0 break-words line-clamp-3">{table.listBy(row)}</span>
                </button>
                {row.is_published === false ? (
                  <span className="shrink-0 rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                    hidden
                  </span>
                ) : null}
                {showDelete && (!canDelete || canDelete(row)) ? (
                  <button onClick={() => onDelete(row)} className="shrink-0 rounded-full border border-red-400/30 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10">
                    Delete
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
