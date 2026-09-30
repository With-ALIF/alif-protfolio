"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { hintCls, inputCls } from "../format/ui";

export default function TechSelector({ value, onChange }) {
  const [tags, setTags] = useState([]);
  const [pick, setPick] = useState("");
  const selected = Array.isArray(value) ? value : [];
  const names = new Set(selected.map((t) => t?.name?.toLowerCase()));
  const available = tags.filter((t) => !names.has(t.name?.toLowerCase()));

  useEffect(() => {
    (async () => {
      const sb = getSupabase();
      if (!sb) return;
      const { data } = await sb.from("portfolio_tags").select("id,name,icon").order("sort_order");
      if (data) setTags(data);
    })();
  }, []);

  const addPicked = () => {
    const found = tags.find((t) => t.name === pick);
    if (!found) return;
    onChange([...selected, { name: found.name, icon: found.icon || "", tag_id: found.id || null }]);
    setPick("");
  };

  const remove = (name) => onChange(selected.filter((t) => t.name !== name));

  return (
    <div>
      <p className={hintCls}>Select from the Technology Icons table — icon is set automatically, no URL needed. If a technology has no icon, add it under Icons first.</p>
      <div className="flex gap-2">
        <select value={pick} onChange={(e) => setPick(e.target.value)} className={`${inputCls} min-w-0 [color-scheme:dark]`}>
          <option value="" className="bg-zinc-900 text-white">— select technology —</option>
          {available.map((t) => (
            <option key={t.name} value={t.name} className="bg-zinc-900 text-white">{t.name}</option>
          ))}
        </select>
        <button type="button" onClick={addPicked} disabled={!pick} className="mt-2 shrink-0 rounded-lg border border-white/15 px-4 hover:bg-white/10 disabled:opacity-40">
          Add
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {selected.map((t) => (
          <span key={t.name} className="inline-flex items-center gap-2 rounded-md bg-blue-500/15 px-3 py-2 text-sm text-blue-100">
            {t.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.icon} alt={t.name} className="h-5 w-5 object-contain" />
            ) : null}
            {t.name}
            <button type="button" onClick={() => remove(t.name)} aria-label={`Remove ${t.name}`} className="text-zinc-400 hover:text-white">×</button>
          </span>
        ))}
        {selected.length === 0 ? <p className="text-xs text-zinc-500">Kono technology select kora hoyni.</p> : null}
      </div>
    </div>
  );
}
