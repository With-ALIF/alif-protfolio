"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { supportsTagId } from "../store/tags";
import { inputCls } from "../format/ui";

// Database name picker: Backend Services skill group. onPick(name, icon, tagId).
// The icon is resolved live through the skill's tag link, so tag URL
// changes apply without re-saving.
export default function DbSelector({ value, onPick }) {
  const [skills, setSkills] = useState([]);
  const [tagIcons, setTagIcons] = useState({});

  useEffect(() => {
    (async () => {
      const sb = getSupabase();
      if (!sb) return;
      const cols = (await supportsTagId(sb, "portfolio_skills")) ? "name,icon,tag_id" : "name,icon";
      const [{ data: s }, { data: t }] = await Promise.all([
        sb.from("portfolio_skills").select(cols).eq("group", "Backend Services").order("sort_order"),
        sb.from("portfolio_tags").select("id,icon"),
      ]);
      if (s) setSkills(s);
      const m = {};
      for (const row of t || []) if (row.id) m[row.id] = row.icon || "";
      setTagIcons(m);
    })();
  }, []);

  const known = skills.some((s) => s.name === value);
  const liveIcon = (s) => (s?.tag_id && tagIcons[s.tag_id]) || s?.icon || "";

  return (
    <select
      value={known ? value : ""}
      onChange={(e) => {
        const s = skills.find((x) => x.name === e.target.value);
        onPick?.(e.target.value, liveIcon(s), s?.tag_id || null);
      }}
      className={`${inputCls} [color-scheme:dark]`}
    >
      <option value="" className="bg-zinc-900 text-white">— select database —</option>
      {skills.map((s) => (
        <option key={s.name} value={s.name} className="bg-zinc-900 text-white">{s.name}</option>
      ))}
      {!known && value ? <option value={value} className="bg-zinc-900 text-white">(custom) {value}</option> : null}
    </select>
  );
}
