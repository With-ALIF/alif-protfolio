"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, adminSignOut, ADMIN_EMAIL } from "@/lib/supabase";

const F = (key, label, type = "text", extra = {}) => ({ key, label, type, ...extra });

const TABLES = [
  {
    name: "alif_site_content",
    label: "Site Content",
    orderBy: "section",
    listBy: (r) => `${r.section} · v${r.version ?? 1}${r.is_published ? "" : " (hidden)"}`,
    fields: [
      F("section", "Section"),
      F("data", "Data (JSON)", "json"),
      F("is_published", "Published", "bool"),
    ],
  },
  {
    name: "alif_projects",
    label: "Projects",
    orderBy: "sort_order",
    listBy: (r) => `${r.sort_order ?? 0} · ${r.title}${r.is_published ? "" : " (hidden)"}`,
    fields: [
      F("title", "Title"),
      F("slug", "Slug"),
      F("description", "Description", "textarea"),
      F("image", "Image URL"),
      F("github", "GitHub URL"),
      F("demo", "Demo URL"),
      F("tags", "Tags (JSON array)", "json"),
      F("featured", "Featured", "bool"),
      F("is_published", "Published", "bool"),
      F("show_github", "Show GitHub", "bool"),
      F("sort_order", "Sort order", "number"),
    ],
  },
  {
    name: "alif_project_details",
    label: "Project Details",
    orderBy: "slug",
    listBy: (r) => r.slug || r.title,
    fields: [
      F("project_id", "Project", "project"),
      F("slug", "Slug"),
      F("title", "Title"),
      F("description", "Short description", "textarea"),
      F("full_description", "Full description", "textarea"),
      F("github_url", "GitHub URL"),
      F("demo_url", "Demo URL"),
      F("thumbnail_url", "Thumbnail URL"),
      F("status", "Status"),
      F("featured", "Featured", "bool"),
      F("tags", "Tags (JSON)", "json"),
      F("technologies", "Technologies (JSON)", "json"),
      F("features", "Features (JSON)", "json"),
      F("gallery", "Gallery (JSON)", "json"),
      F("timeline", "Timeline (JSON)", "json"),
      F("challenges", "Challenges (JSON)", "json"),
      F("solutions", "Solutions (JSON)", "json"),
      F("statistics", "Statistics (JSON)", "json"),
      F("database_info", "Database info (JSON)", "json"),
      F("show_database", "Show database", "bool"),
      F("show_github", "Show GitHub", "bool"),
      F("show_demo", "Show demo", "bool"),
    ],
  },
  {
    name: "alif_skills",
    label: "Skills",
    orderBy: "sort_order",
    listBy: (r) => `${r.group || "Other"} · ${r.name}`,
    fields: [
      F("name", "Name"),
      F("icon", "Icon URL"),
      F("group", "Group", "select", {
        options: ["Languages", "Frameworks", "Backend Services", "Tools", "Other"],
      }),
      F("level", "Level (0-100)", "number"),
      F("sort_order", "Sort order", "number"),
    ],
  },
  {
    name: "alif_tools",
    label: "Tools",
    orderBy: "sort_order",
    listBy: (r) => `${r.sort_order ?? 0} · ${r.name}`,
    fields: [F("name", "Name"), F("icon", "Icon URL"), F("sort_order", "Sort order", "number")],
  },
  {
    name: "alif_tag",
    label: "Tag Icons",
    orderBy: "sort_order",
    listBy: (r) => r.name,
    fields: [F("name", "Name"), F("icon", "Icon URL"), F("sort_order", "Sort order", "number")],
  },
  {
    name: "alif_education",
    label: "Education",
    orderBy: "sort_order",
    listBy: (r) => `${r.sort_order ?? 0} · ${r.degree} — ${r.institute}`,
    fields: [
      F("degree", "Degree"),
      F("institute", "Institute"),
      F("district", "District"),
      F("class", "Class / Level"),
      F("year", "Year"),
      F("description", "Description", "textarea"),
      F("logo", "Logo URL"),
      F("sort_order", "Sort order", "number"),
    ],
  },
  {
    name: "alif_experience",
    label: "Experience",
    orderBy: "sort_order",
    listBy: (r) => `${r.sort_order ?? 0} · ${r.role} @ ${r.company}`,
    fields: [
      F("role", "Role"),
      F("company", "Company"),
      F("logo", "Logo URL"),
      F("duration", "Duration"),
      F("status", "Status"),
      F("description", "Description", "textarea"),
      F("sort_order", "Sort order", "number"),
    ],
  },
  {
    name: "alif_services",
    label: "Services",
    orderBy: "sort_order",
    listBy: (r) => `${r.sort_order ?? 0} · ${r.title}`,
    fields: [
      F("title", "Title"),
      F("icon", "Icon", "select", { options: ["code", "monitor", "brush", "wrench"] }),
      F("description", "Description", "textarea"),
      F("sort_order", "Sort order", "number"),
    ],
  },
  {
    name: "alif_reviews",
    label: "Reviews",
    orderBy: "created_at",
    listBy: (r) => `${r.name}${r.is_published ? "" : " (hidden)"}`,
    fields: [
      F("name", "Name"),
      F("image", "Image URL"),
      F("comment", "Comment", "textarea"),
      F("is_published", "Published", "bool"),
    ],
  },
];

const pretty = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
};

const blankFor = (table) => {
  const obj = {};
  for (const f of table.fields) {
    obj[f.key] = f.type === "bool" ? (f.key === "is_published" || f.key.startsWith("show_") ? true : false)
      : f.type === "number" ? 0
      : f.type === "select" ? (f.options?.[0] ?? "")
      : f.type === "json" ? (f.key === "tags" || f.key.endsWith("s") ? "[]" : "{}")
      : "";
  }
  return obj;
};

export default function AdminPanel({ user }) {
  const [activeName, setActiveName] = useState(TABLES[0].name);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [projectOptions, setProjectOptions] = useState([]);

  const table = TABLES.find((t) => t.name === activeName);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    const { data, error: err } = await sb.from(activeName).select("*").order(table.orderBy, { ascending: true });
    if (err) {
      setError(err.message);
      setRows([]);
    } else {
      setRows(data || []);
    }
    if (activeName === "alif_project_details") {
      const { data: projs } = await sb.from("alif_projects").select("id,title,slug").order("sort_order");
      setProjectOptions(projs || []);
    }
    setLoading(false);
  }, [activeName, table]);

  useEffect(() => {
    setEditing(null);
    setNotice("");
    load();
  }, [load]);

  const startNew = () => {
    setIsNew(true);
    setForm(blankFor(table));
    setEditing({});
    setError("");
    setNotice("");
  };

  const startEdit = (row) => {
    const obj = {};
    for (const f of table.fields) obj[f.key] = pretty(row[f.key]);
    setIsNew(false);
    setForm(obj);
    setEditing(row);
    setError("");
    setNotice("");
  };

  const buildPayload = () => {
    const payload = {};
    for (const f of table.fields) {
      const raw = form[f.key];
      if (f.type === "bool") payload[f.key] = !!raw;
      else if (f.type === "number") payload[f.key] = raw === "" ? 0 : Number(raw);
      else if (f.type === "json") {
        const text = String(raw || "").trim();
        try {
          payload[f.key] = text === "" ? (f.key === "tags" ? [] : {}) : JSON.parse(text);
        } catch {
          throw new Error(`Invalid JSON in "${f.label}".`);
        }
      } else payload[f.key] = raw ?? "";
    }
    return payload;
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const sb = getSupabase();
      const payload = buildPayload();
      if (isNew) {
        const { error: err } = await sb.from(activeName).insert(payload);
        if (err) throw err;
        setNotice("Added.");
      } else {
        const { error: err } = await sb.from(activeName).update(payload).eq("id", editing.id);
        if (err) throw err;
        setNotice("Saved.");
      }
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete this ${table.label.slice(0, -1) || "row"}?${activeName === "alif_projects" ? " Its case-study details will be deleted too (cascade)." : ""}`)) return;
    setError("");
    setNotice("");
    const sb = getSupabase();
    const { error: err } = await sb.from(activeName).delete().eq("id", row.id);
    if (err) {
      setError(err.message);
      return;
    }
    if (editing?.id === row.id) setEditing(null);
    setNotice("Deleted.");
    await load();
  };

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#090b10]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Portfolio CMS</p>
            <p className="text-xs text-zinc-500">{user?.email} · {ADMIN_EMAIL === user?.email ? "admin" : "unknown"}</p>
          </div>
          <div className="flex gap-2">
            <a href="/" className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10">
              View site
            </a>
            <button
              onClick={adminSignOut}
              className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {TABLES.map((t) => (
            <button
              key={t.name}
              onClick={() => setActiveName(t.name)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                t.name === activeName ? "bg-blue-500 text-white" : "border border-white/10 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>
        )}
        {notice && (
          <p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{notice}</p>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-lg border border-white/10 bg-zinc-900/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">{table.label} ({rows.length})</h2>
              <button onClick={startNew} className="rounded-full bg-blue-500 px-4 py-1.5 text-sm font-semibold hover:bg-blue-400">
                + Add
              </button>
            </div>
            {loading ? (
              <p className="text-sm text-zinc-400">Loading…</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-zinc-400">No rows yet.</p>
            ) : (
              <ul className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className={`flex items-center justify-between gap-2 rounded-lg border p-3 text-sm ${
                      editing?.id === row.id ? "border-blue-400/50 bg-blue-500/10" : "border-white/10 bg-black/20"
                    }`}
                  >
                    <button onClick={() => startEdit(row)} className="min-w-0 flex-1 truncate text-left hover:text-white">
                      {table.listBy(row)}
                    </button>
                    <button
                      onClick={() => handleDelete(row)}
                      className="shrink-0 rounded-full border border-red-400/30 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-white/10 bg-zinc-900/60 p-4">
            {!editing ? (
              <p className="text-sm text-zinc-400">Select a row to edit, or add a new one.</p>
            ) : (
              <div className="space-y-4">
                <h2 className="font-semibold">{isNew ? `New ${table.label.slice(0, -1) || "row"}` : "Edit"}</h2>
                {table.fields.map((f) => (
                  <label key={f.key} className="block">
                    <span className="text-sm font-medium text-zinc-300">{f.label}</span>
                    {f.type === "bool" ? (
                      <input
                        type="checkbox"
                        checked={!!form[f.key]}
                        onChange={(e) => setField(f.key, e.target.checked)}
                        className="ml-3 h-4 w-4 accent-blue-500"
                      />
                    ) : f.type === "textarea" || f.type === "json" ? (
                      <textarea
                        value={form[f.key] ?? ""}
                        onChange={(e) => setField(f.key, e.target.value)}
                        rows={f.type === "json" ? 6 : 3}
                        className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-sm text-white outline-none focus:border-blue-400"
                      />
                    ) : f.type === "select" ? (
                      <select
                        value={form[f.key] ?? ""}
                        onChange={(e) => setField(f.key, e.target.value)}
                        className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-white outline-none focus:border-blue-400"
                      >
                        {(f.options || []).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : f.type === "project" ? (
                      <select
                        value={form[f.key] ?? ""}
                        onChange={(e) => setField(f.key, e.target.value)}
                        className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-white outline-none focus:border-blue-400"
                      >
                        <option value="">— select project —</option>
                        {projectOptions.map((p) => (
                          <option key={p.id} value={p.id}>{p.title} ({p.slug})</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type === "number" ? "number" : "text"}
                        value={form[f.key] ?? ""}
                        onChange={(e) => setField(f.key, f.type === "number" ? e.target.value : e.target.value)}
                        className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-white outline-none focus:border-blue-400"
                      />
                    )}
                  </label>
                ))}
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-full bg-blue-500 px-6 py-2 font-semibold hover:bg-blue-400 disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="rounded-full border border-white/15 px-6 py-2 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
