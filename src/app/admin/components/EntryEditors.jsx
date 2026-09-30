"use client";

import { useState } from "react";
import { boxCls, hintCls, inputCls } from "../format/ui";

// Bulk text → entries. Accepts "1. foo 2. bar" (inline or with newlines)
// or plain one-per-line text; leading numbers are stripped.
export function parseNumberedList(text) {
  const t = String(text || "").trim();
  if (!t) return [];
  const chunks = t.split(/(?=\b\d{1,3}[.)\-:]\s+)/);
  const clean = chunks
    .map((c) => c.replace(/^\s*\d{1,3}[.)\-:]\s*/, "").trim())
    .filter(Boolean);
  if (clean.length >= 2) return clean;
  return t
    .split(/\n+/)
    .map((l) => l.replace(/^\s*\d{1,3}[.)\-:]\s*/, "").trim())
    .filter(Boolean);
}

export function StringListEditor({ value, onChange, itemLabel = "entry" }) {
  const items = Array.isArray(value) ? value : [];
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const parsed = parseNumberedList(bulkText);
  const update = (idx, v) => onChange(items.map((it, i) => (i === idx ? v : it)));
  const add = () => onChange([...items, ""]);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  const move = (idx, dir) => {
    const to = idx + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[idx], next[to]] = [next[to], next[idx]];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className={hintCls}>Numbered automatically — “+ Add” creates the next number. Wrap a word in <span className="font-mono">**word**</span> to bold it on the site.</p>
        <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-zinc-400">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/15 p-4 text-sm text-zinc-500">
          No {itemLabel} yet — click “+ Add {itemLabel}” below.
        </p>
      ) : null}
      {items.map((it, idx) => (
        <div key={idx} className="flex gap-2">
          <span className="mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/10 text-sm font-semibold text-blue-200">
            {idx + 1}
          </span>
          <textarea
            value={it ?? ""}
            onChange={(e) => update(idx, e.target.value)}
            rows={3}
            placeholder={`${idx + 1}. ${itemLabel} text…`}
            className={`${inputCls} min-w-0`}
          />
          <div className="mt-2 flex shrink-0 flex-col gap-1">
            <button
              type="button"
              onClick={() => move(idx, -1)}
              disabled={idx === 0}
              aria-label="Move up"
              className="rounded border border-white/10 px-2 text-xs text-zinc-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(idx, 1)}
              disabled={idx === items.length - 1}
              aria-label="Move down"
              className="rounded border border-white/10 px-2 text-xs text-zinc-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => remove(idx)}
              aria-label="Remove"
              className="rounded border border-red-400/30 px-2 text-xs text-red-300 hover:bg-red-500/10"
            >
              ×
            </button>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={add} className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10">
          + Add {itemLabel}
        </button>
        <button
          type="button"
          onClick={() => setShowBulk((v) => !v)}
          className={`rounded-full border px-4 py-2 text-sm hover:bg-white/10 ${showBulk ? "border-blue-400/50 bg-blue-500/10" : "border-white/15"}`}
        >
          {showBulk ? "− Hide bulk paste" : "+ Bulk paste"}
        </button>
      </div>
      {showBulk ? (
        <div className={boxCls}>
          <p className="text-xs text-zinc-400">
            Paste numbered text — <span className="font-mono">1. … 2. … 3. …</span> or one per line. Numbers are stripped, entries keep the list order.
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={5}
            placeholder={`1. first ${itemLabel}… 2. second ${itemLabel}…`}
            className={`${inputCls} font-mono text-sm`}
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-400">
              {bulkText.trim() ? `${parsed.length} ${parsed.length === 1 ? "entry" : "entries"} detected` : "Nothing pasted yet"}
            </span>
            <button
              type="button"
              onClick={() => {
                onChange([...items, ...parsed]);
                setBulkText("");
              }}
              disabled={parsed.length === 0}
              className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add {parsed.length > 0 ? `${parsed.length} ` : ""}to list
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Bulk text → timeline phases. One phase per line:
//   Phase 1 | Planning | Designed the architecture
//   Week 2 | Build | Implemented the API
// A leading "1." number is stripped; missing parts become "".
export function parseTimelineBulk(text) {
  return String(text || "")
    .split(/\n+/)
    .map((l) => l.replace(/^\s*\d{1,3}[.)\-:]\s*/, "").trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length >= 3) {
        const [date, title, ...rest] = parts;
        return { date, title, detail: rest.join(" | ") };
      }
      if (parts.length === 2) return { date: parts[0], title: parts[1], detail: "" };
      return { date: "", title: parts[0], detail: "" };
    });
}

export function TimelineEditor({ value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const parsed = parseTimelineBulk(bulkText);
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
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={add} className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10">+ Add phase</button>
        <button
          type="button"
          onClick={() => setShowBulk((v) => !v)}
          className={`rounded-full border px-4 py-2 text-sm hover:bg-white/10 ${showBulk ? "border-blue-400/50 bg-blue-500/10" : "border-white/15"}`}
        >
          {showBulk ? "− Hide bulk paste" : "+ Bulk paste"}
        </button>
      </div>
      {showBulk ? (
        <div className={boxCls}>
          <p className="text-xs text-zinc-400">
            One phase per line — <span className="font-mono">date | title | detail</span>. A leading <span className="font-mono">1.</span> number is stripped.
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={5}
            placeholder={"Phase 1 | Planning | Designed the UI\nWeek 2 | Build | Implemented the API"}
            className={`${inputCls} font-mono text-sm`}
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-400">
              {bulkText.trim() ? `${parsed.length} ${parsed.length === 1 ? "phase" : "phases"} detected` : "Nothing pasted yet"}
            </span>
            <button
              type="button"
              onClick={() => {
                onChange([...items, ...parsed]);
                setBulkText("");
              }}
              disabled={parsed.length === 0}
              className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add {parsed.length > 0 ? `${parsed.length} ` : ""}to list
            </button>
          </div>
        </div>
      ) : null}
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
