"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { hintCls, inputCls } from "../format/ui";

// Skill icon picker: dropdown of the Icons table. Stored value = icon URL.
// Picking an icon also syncs the skill Name.
export default function IconSelector({ value, onPick }) {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    (async () => {
      const sb = getSupabase();
      if (!sb) return;
      const { data } = await sb.from("portfolio_tags").select("name,icon").order("sort_order");
      if (data) setTags(data);
    })();
  }, []);

  const current = tags.find((t) => t.icon === value);
  const custom = value && !current ? value : "";

  const pick = (iconUrl) => {
    const tag = tags.find((t) => t.icon === iconUrl);
    onPick?.(iconUrl, tag ? tag.name : "");
  };

  return (
    <div>
      <p className={hintCls}>Icons table theke select koro — URL nije likhte hobe na.</p>
      <select value={current ? current.icon : ""} onChange={(e) => pick(e.target.value)} className={`${inputCls} [color-scheme:dark]`}>
        <option value="" className="bg-zinc-900 text-white">— select icon —</option>
        {tags.map((t) => (
          <option key={t.name} value={t.icon || ""} className="bg-zinc-900 text-white">{t.name}</option>
        ))}
        {custom ? <option value={custom} className="bg-zinc-900 text-white">(custom) {String(custom).slice(0, 40)}</option> : null}
      </select>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="icon preview" className="mt-2 h-10 w-10 rounded object-contain border border-white/10 bg-black/30 p-1" />
      ) : null}
    </div>
  );
}
