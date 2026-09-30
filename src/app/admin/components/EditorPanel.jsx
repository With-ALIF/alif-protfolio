"use client";

import FieldInput from "./FieldInput";

export default function EditorPanel({ table, editing, isNew, form, saving, projectOptions, onField, onSave, onCancel }) {
  if (!editing) return <p className="text-sm text-zinc-400">Select a row to edit, or add a new one.</p>;
  const bigLabels = table.name === "alif_projects" || table.name === "alif_project_details";
  return (
    <div className="space-y-4">
      <h2 className="font-semibold">{isNew ? `New ${table.label.slice(0, -1) || "row"}` : "Edit"}</h2>
      {table.fields.filter((f) => f.type !== "hidden").map((f) => (
        <label key={f.key} className="block">
          <span className={bigLabels ? "text-base font-semibold text-blue-500" : "text-sm font-medium text-zinc-300"}>{f.label}</span>
          <div>
            <FieldInput field={f} value={form[f.key]} tagId={form.tag_id} section={form.section} projectOptions={projectOptions} onChange={(v) => onField(f.key, v)} onPickName={(name) => onField("name", name)} onPickTagId={(id) => onField("tag_id", id)} disabled={!isNew && f.key === "section"} />
          </div>
        </label>
      ))}
      <div className="flex gap-2">
        <button onClick={onSave} disabled={saving} className={`rounded-full bg-blue-500 font-semibold hover:bg-blue-400 disabled:opacity-60 ${bigLabels ? "px-8 py-2.5 text-base" : "px-6 py-2"}`}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={onCancel} className="rounded-full border border-white/15 px-6 py-2 hover:bg-white/10">
          Cancel
        </button>
      </div>
    </div>
  );
}
