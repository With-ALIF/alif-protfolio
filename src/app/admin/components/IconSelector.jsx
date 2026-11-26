"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { inputCls } from "../format/ui";

export default function IconSelector({ value, tagId, onPick, onPickTagId }) {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    (async () => {
      const sb = getSupabase();
      if (!sb) return;
      const { data } = await sb.from("portfolio_tags").select("id,name,icon").order("sort_order");
      if (data) setTags(data);
    })();
  }, []);

  const current = tags.find((t) => t.id === tagId) || tags.find((t) => t.icon === value);
  const custom = value && !current ? value : "";
  const preview = current?.icon || value || "";

  useEffect(() => {
    if (tags.length === 0) return;
    if (tagId) {
      if (!tags.some((t) => t.id === tagId)) onPickTagId?.(null);
    } else if (value) {
      const m = tags.find((t) => t.icon === value);
      if (m) onPickTagId?.(m.id);
    }
  }, [tags, tagId, value, onPickTagId]);

  const pick = (iconUrl) => {
    const tag = tags.find((t) => t.icon === iconUrl);
    onPick?.(iconUrl, tag || null);
  };

  return (
    <div>
      <select value={current ? current.icon : ""} onChange={(e) => pick(e.target.value)} className={`${inputCls} [color-scheme:dark]`}>
        <option value="" className="bg-zinc-900 text-white">— select icon —</option>
        {tags.map((t) => (
          <option key={t.id || t.name} value={t.icon || ""} className="bg-zinc-900 text-white">{t.name}</option>
        ))}
        {custom ? <option value={custom} className="bg-zinc-900 text-white">(custom) {String(custom).slice(0, 40)}</option> : null}
      </select>
      {preview ? (
        <img src={preview} alt="icon preview" className="mt-2 h-10 w-10 rounded object-contain border border-white/10 bg-black/30 p-1" />
      ) : null}
    </div>
  );
}
