"use client";

import { boxCls, hintCls, inputCls } from "../format/ui";

export function StringListEditor({ value, onChange, placeholder }) {
  const items = Array.isArray(value) ? value : [];
  const update = (idx, v) => onChange(items.map((it, i) => (i === idx ? v : it)));
  const add = () => onChange([...items, ""]);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  return (
    <div className="space-y-2">
      <p className={hintCls}>Add entries one by one — JSON is auto-generated on save.</p>
      {items.map((it, idx) => (
        <div key={idx} className="flex gap-2">
          <input value={it ?? ""} onChange={(e) => update(idx, e.target.value)} placeholder={placeholder || `Item #${idx + 1}`} className={`${inputCls} min-w-0`} />
          <button type="button" onClick={() => remove(idx)} aria-label="Remove" className="mt-2 shrink-0 rounded-lg border border-red-400/30 px-3 text-red-300 hover:bg-red-500/10">×</button>
        </div>
      ))}
      <button type="button" onClick={add} className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10">+ Add entry</button>
    </div>
  );
}

export function TimelineEditor({ value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const update = (idx, patch) => onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const add = () => onChange([...items, { date: "", title: "", detail: "" }]);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  return (
    <div className="space-y-3">
      <p className={hintCls}>Each phase is a separate card — write Date, Title and Detail as plain text.</p>
      {items.map((it, idx) => (
        <div key={idx} className={boxCls}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Phase #{idx + 1}</p>
            <button type="button" onClick={() => remove(idx)} className="rounded-full border border-red-400/30 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10">Remove</button>
          </div>
          <label className="block"><span className="text-xs text-zinc-400">Date (Phase 1 / Week 2...)</span><input value={it.date || ""} onChange={(e) => update(idx, { date: e.target.value })} className={inputCls} placeholder="Phase 1" /></label>
          <label className="block"><span className="text-xs text-zinc-400">Title</span><input value={it.title || ""} onChange={(e) => update(idx, { title: e.target.value })} className={inputCls} /></label>
          <label className="block"><span className="text-xs text-zinc-400">Detail</span><textarea value={it.detail || ""} onChange={(e) => update(idx, { detail: e.target.value })} rows={2} className={inputCls} /></label>
        </div>
      ))}
      <button type="button" onClick={add} className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10">+ Add phase</button>
    </div>
  );
}

export function StatsEditor({ value, onChange }) {
  const obj = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const entries = Object.entries(obj);
  const setEntries = (next) => onChange(Object.fromEntries(next));
  const update = (idx, k, v) => setEntries(entries.map((e, i) => (i === idx ? [k, v] : e)));
  const add = () => setEntries([...entries, ["", ""]]);
  const remove = (idx) => setEntries(entries.filter((_, i) => i !== idx));
  return (
    <div className="space-y-2">
      <p className={hintCls}>Write Label and Value in separate boxes — no need for ":".</p>
      {entries.map(([k, v], idx) => (
        <div key={idx} className="flex gap-2">
          <input value={k} onChange={(e) => update(idx, e.target.value, v)} placeholder="Label" className={`${inputCls} min-w-0`} />
          <input value={v} onChange={(e) => update(idx, k, e.target.value)} placeholder="Value" className={`${inputCls} min-w-0`} />
          <button type="button" onClick={() => remove(idx)} aria-label="Remove" className="mt-2 shrink-0 rounded-lg border border-red-400/30 px-3 text-red-300 hover:bg-red-500/10">×</button>
        </div>
      ))}
      <button type="button" onClick={add} className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10">+ Add stat</button>
    </div>
  );
}
