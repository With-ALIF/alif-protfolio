"use client";

import { boxCls, hintCls, inputCls } from "../format/ui";
import ImageInput from "../components/ImageInput";

export default function AwardsEditor({ data, onChange }) {
  const items = Array.isArray(data.items) ? data.items : [];
  const updateItem = (idx, patch) =>
    onChange({ ...data, items: items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) });
  const addItem = () => {
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : String(Date.now());
    onChange({
      ...data,
      items: [...items, { id, title: "", issuer: "", image: "", description: "", date: "", sortOrder: items.length + 1, isPublished: true }],
    });
  };
  const removeItem = (idx) => onChange({ ...data, items: items.filter((_, i) => i !== idx) });
  return (
    <div className="space-y-3">
      <p className={hintCls}>Each award = normal text fields. No JSON needed.</p>
      {items.map((it, idx) => (
        <div key={it.id || idx} className={boxCls}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Award #{idx + 1}</p>
            <button type="button" onClick={() => removeItem(idx)} className="rounded-full border border-red-400/30 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10">Remove</button>
          </div>
          <label className="block"><span className="text-xs text-zinc-400">Title</span><input value={it.title || ""} onChange={(e) => updateItem(idx, { title: e.target.value })} className={inputCls} /></label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="block"><span className="text-xs text-zinc-400">Issuer</span><input value={it.issuer || ""} onChange={(e) => updateItem(idx, { issuer: e.target.value })} className={inputCls} /></label>
            <label className="block"><span className="text-xs text-zinc-400">Date</span><input value={it.date || ""} onChange={(e) => updateItem(idx, { date: e.target.value })} className={inputCls} placeholder="2026-08-25" /></label>
          </div>
          <label className="block"><span className="text-xs text-zinc-400">Image URL + Upload</span><ImageInput value={it.image || ""} onChange={(url) => updateItem(idx, { image: url })} /></label>
          <label className="block"><span className="text-xs text-zinc-400">Description</span><textarea value={it.description || ""} onChange={(e) => updateItem(idx, { description: e.target.value })} rows={3} className={inputCls} /></label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="block"><span className="text-xs text-zinc-400">Sort order</span><input type="number" value={it.sortOrder ?? idx + 1} onChange={(e) => updateItem(idx, { sortOrder: Number(e.target.value) })} className={inputCls} /></label>
            <label className="flex items-center gap-2 text-xs text-zinc-400">Published<input type="checkbox" checked={it.isPublished !== false} onChange={(e) => updateItem(idx, { isPublished: e.target.checked })} className="h-4 w-4 accent-blue-500" /></label>
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem} className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10">+ Add award</button>
    </div>
  );
}
