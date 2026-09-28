"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { inputCls } from "../format/ui";

// Database name picker: Backend Services skill group. onPick(name, icon).
export default function DbSelector({ value, onPick }) {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    (async () => {
      const sb = getSupabase();
      if (!sb) return;
      const { data } = await sb.from("portfolio_skills").select("name,icon").eq("group", "Backend Services").order("sort_order");
      if (data) setSkills(data);
    })();
  }, []);

  const known = skills.some((s) => s.name === value);

  return (
    <select
      value={known ? value : ""}
      onChange={(e) => {
        const s = skills.find((x) => x.name === e.target.value);
        onPick?.(e.target.value, s?.icon || "");
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
