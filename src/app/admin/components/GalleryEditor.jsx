"use client";

import ImageInput from "./ImageInput";
import { boxCls, hintCls, inputCls } from "../format/ui";

export default function GalleryEditor({ value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const update = (idx, patch) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const add = () => onChange([...items, { title: "", image: "" }]);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  return (
    <div className="space-y-3">
      <p className={hintCls}>Write a title and upload an image (auto-resized to ≤100KB).</p>
      {items.map((it, idx) => (
        <div key={idx} className={boxCls}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Image #{idx + 1}</p>
            <button type="button" onClick={() => remove(idx)} className="rounded-full border border-red-400/30 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10">Remove</button>
          </div>
          <label className="block"><span className="text-xs text-zinc-400">Title</span><input value={it.title || ""} onChange={(e) => update(idx, { title: e.target.value })} className={inputCls} /></label>
          <div className="block">
            <span className="text-xs text-zinc-400">Image URL + Upload</span>
            <ImageInput value={it.image || ""} onChange={(url) => update(idx, { image: url })} />
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10">+ Add image</button>
    </div>
  );
}
