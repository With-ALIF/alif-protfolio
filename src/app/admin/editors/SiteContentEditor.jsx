"use client";

import { inputCls } from "../format/ui";
import SiteEditor from "./SiteEditor";
import { AboutEditor, HeroEditor } from "./HeroAboutJourney";
import AwardsEditor from "./AwardsEditor";

export default function SiteContentEditor({ section, data, onChange }) {
  if (section === "site") return <SiteEditor data={data} onChange={onChange} />;
  if (section === "hero") return <HeroEditor data={data} onChange={onChange} />;
  if (section === "about") return <AboutEditor data={data} onChange={onChange} />;
  if (section === "awards") return <AwardsEditor data={data} onChange={onChange} />;
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-300">Data (JSON — unknown section)</span>
      <textarea
        value={JSON.stringify(data, null, 2)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {
            /* ignore while typing */
          }
        }}
        rows={8}
        className={`${inputCls} font-mono text-sm`}
      />
    </label>
  );
}
