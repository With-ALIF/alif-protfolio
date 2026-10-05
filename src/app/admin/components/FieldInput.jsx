"use client";

import { SITE_SECTIONS } from "../tables";
import { boxCls, hintCls, inputCls } from "../format/ui";
import SiteContentEditor from "../editors/SiteContentEditor";
import ImageInput from "./ImageInput";
import TechStackEditor from "./TechStackEditor";
import TagSelector from "./TagSelector";
import DbSelector from "./DbSelector";
import IconSelector from "./IconSelector";
import GalleryEditor from "./GalleryEditor";
import { StringListEditor, TimelineEditor, StatsEditor } from "./EntryEditors";

export default function FieldInput({ field, value, tagId, section, projectOptions, onChange, onPickName, onPickTagId, disabled }) {
  if (field.type === "hidden" || field.type === "tagref") return null;
  if (field.type === "image") return <ImageInput value={value} onChange={onChange} />;
  if (field.type === "techstack") return <TechStackEditor value={value} onChange={onChange} />;
  if (field.type === "tagselect") return <TagSelector value={value} onChange={onChange} />;
  if (field.type === "iconselect")
    return (
      <IconSelector
        value={value}
        tagId={tagId}
        onPick={(url, tag) => {
          onChange(url);
          if (tag?.name) onPickName?.(tag.name);
          onPickTagId?.(tag?.id || null);
        }}
        onPickTagId={onPickTagId}
      />
    );
  if (field.type === "galleryedit") return <GalleryEditor value={value} onChange={onChange} />;
  if (field.type === "timelineedit") return <TimelineEditor value={value} onChange={onChange} />;
  if (field.type === "listedit")
    return <StringListEditor value={value} onChange={onChange} itemLabel={field.item || "entry"} />;
  if (field.type === "statsedit") return <StatsEditor value={value} onChange={onChange} />;
  if (field.type === "bool")
    return (
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="ml-3 h-4 w-4 accent-blue-500" />
    );
  if (field.type === "sitesection") {
    if (disabled) return <p className="mt-2 rounded-lg border border-white/10 bg-black/30 p-3 text-zinc-400">{value || SITE_SECTIONS[0]}</p>;
    return (
      <select value={value ?? SITE_SECTIONS[0]} onChange={(e) => onChange(e.target.value)} className={`${inputCls} [color-scheme:dark]`}>
        {SITE_SECTIONS.map((s) => (
          <option key={s} value={s} className="bg-zinc-900 text-white">{s}</option>
        ))}
      </select>
    );
  }
  if (field.type === "sitecontent")
    return <SiteContentEditor section={section || SITE_SECTIONS[0]} data={value || {}} onChange={onChange} />;
  if (["lines", "techlines", "gallerylines", "timelinelines", "kvlines"].includes(field.type))
    return (
      <>
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          placeholder={field.type === "lines" ? "One item per line" : field.type === "kvlines" ? "Label : Value" : "Name | URL"}
          className={`${inputCls} font-mono text-sm`}
        />
        <p className={hintCls}>Normal text — JSON auto-generated on save.</p>
      </>
    );
  if (field.type === "dbinfo") {
    const v = value || {};
    const setDb = (patch) => onChange({ name: v.name || "", icon: v.icon || "", description: v.description || "", tag_id: v.tag_id || null, ...patch });
    return (
      <div className={boxCls}>
        <label className="block"><span className="text-xs text-zinc-400">Name (from Backend Services)</span><DbSelector value={v.name || ""} onPick={(name, icon, tagId) => setDb({ name, icon, tag_id: tagId ?? null })} /></label>
        <label className="block"><span className="text-xs text-zinc-400">Icon URL + Upload</span><ImageInput value={v.icon || ""} onChange={(url) => setDb({ icon: url, tag_id: null })} /></label>
        <label className="block"><span className="text-xs text-zinc-400">Description</span><textarea value={v.description || ""} onChange={(e) => setDb({ description: e.target.value })} rows={3} className={inputCls} /></label>
      </div>
    );
  }
  if (field.type === "textarea")
    return (
      <>
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          readOnly={field.readOnly}
          title={field.readOnly ? "Auto-generated from the project, not editable" : undefined}
          className={`${inputCls} ${field.readOnly ? "cursor-not-allowed text-zinc-400" : ""}`}
        />
        {field.hint && !field.readOnly ? <p className={hintCls}>{field.hint}</p> : null}
      </>
    );
  if (field.type === "select")
    return (
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${inputCls} [color-scheme:dark]`}>
        {(field.options || []).map((opt) => (
          <option key={opt} value={opt} className="bg-zinc-900 text-white">{opt}</option>
        ))}
      </select>
    );
  if (field.type === "project")
    return (
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${inputCls} [color-scheme:dark]`}>
        <option value="" className="bg-zinc-900 text-white">— select project —</option>
        {projectOptions.map((p) => (
          <option key={p.id} value={p.id} className="bg-zinc-900 text-white">{p.title} ({p.slug})</option>
        ))}
      </select>
    );
  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      readOnly={field.readOnly}
      title={field.readOnly ? "Auto-generated, not editable" : undefined}
      className={`${inputCls} ${field.readOnly ? "cursor-not-allowed text-zinc-400" : ""}`}
    />
  );
}
