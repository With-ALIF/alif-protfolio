"use client";

import { highlightsToText, paragraphsToText, textToHighlights, textToParagraphs } from "../format/site";
import { hintCls, inputCls } from "../format/ui";

export function HeroEditor({ data, onChange }) {
  const set = (patch) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-3">
      <p className={hintCls}>Highlights per line: <code>30+ | Projects Completed</code></p>
      <label className="block">
        <span className="text-sm font-medium text-zinc-300">Headline</span>
        <input value={data.headline || ""} onChange={(e) => set({ headline: e.target.value })} className={inputCls} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-300">Value / sub headline</span>
        <textarea value={data.value || ""} onChange={(e) => set({ value: e.target.value })} rows={3} className={inputCls} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-300">Highlights (one per line)</span>
        <textarea value={highlightsToText(data.highlights)} onChange={(e) => set({ highlights: textToHighlights(e.target.value) })} rows={5} className={`${inputCls} font-mono text-sm`} />
      </label>
    </div>
  );
}

export function AboutEditor({ data, onChange }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-300">Paragraphs</span>
      <p className={hintCls}>Blank line separates paragraphs. HTML allowed.</p>
      <textarea value={paragraphsToText(data.paragraphs)} onChange={(e) => onChange({ ...data, paragraphs: textToParagraphs(e.target.value) })} rows={10} className={inputCls} />
    </label>
  );
}
