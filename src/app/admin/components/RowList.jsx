"use client";

export function StatusBanner({ error, notice }) {
  return (
    <>
      {error && <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
      {notice && <p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{notice}</p>}
    </>
  );
}

export default function RowList({ table, rows, loading, editing, onEdit, onDelete, onNew, canDelete }) {
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{table.label} ({rows.length})</h2>
        <button onClick={onNew} className="rounded-full bg-blue-500 px-4 py-1.5 text-sm font-semibold hover:bg-blue-400">
          + Add
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-zinc-400">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-zinc-400">No rows yet.</p>
      ) : (
        <ul className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {rows.map((row) => (
            <li
              key={row.id}
              className={`flex items-center justify-between gap-2 rounded-lg border p-3 text-sm ${
                editing?.id === row.id ? "border-blue-400/50 bg-blue-500/10" : "border-white/10 bg-black/20"
              }`}
            >
              <button onClick={() => onEdit(row)} className="min-w-0 flex-1 break-words text-left leading-6 line-clamp-3 hover:text-white">
                {table.listBy(row)}
              </button>
              {row.is_published === false ? (
                <span className="shrink-0 rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                  hidden
                </span>
              ) : null}
              {canDelete && !canDelete(row) ? null : (
                <button onClick={() => onDelete(row)} className="shrink-0 rounded-full border border-red-400/30 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10">
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
