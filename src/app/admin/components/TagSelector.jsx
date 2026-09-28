"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { hintCls } from "../format/ui";

// Multi-select tags from the Icons table. Value = array of tag names.
export default function TagSelector({ value, onChange }) {
  const [tags, setTags] = useState([]);
  const selected = Array.isArray(value) ? value : [];

  useEffect(() => {
    (async () => {
      const sb = getSupabase();
      if (!sb) return;
      const { data } = await sb.from("portfolio_tags").select("name,icon").order("sort_order");
      if (data) setTags(data);
    })();
  }, []);

  const toggle = (name) =>
    onChange(selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name]);

  return (
    <div>
      <p className={hintCls}>Icons table theke tag select koro — nije likhte hobe na.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((t) => {
          const on = selected.includes(t.name);
          return (
            <button
              key={t.name}
              type="button"
              onClick={() => toggle(t.name)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                on ? "border-blue-400/60 bg-blue-500/20 text-white" : "border-white/15 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {t.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.icon} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} className="h-4 w-4 object-contain" />
              ) : null}
              {t.name}
            </button>
          );
        })}
        {tags.length === 0 ? <p className="text-xs text-zinc-500">Loading…</p> : null}
      </div>
    </div>
  );
}
