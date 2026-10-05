"use client";

// Per-project Technology Stack editor. Categories are NOT created here — they
// live in the global portfolio_tech_categories table and are managed from the
// admin's "Tech Categories" section. Each technology is assigned to one of
// those categories by its UUID (category_id).
//
// Value shape (owned by the parent form, persisted by the details store):
//   [{ id: <category uuid>, name: <label for display>, technologies: [{ name, icon, tag_id }] }]

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { supportsTechGroups } from "../store/tags";
import { hintCls, inputCls } from "../format/ui";

const CATEGORIES_TABLE = "portfolio_tech_categories";

const clean = (s) => String(s ?? "").trim();

export default function TechStackEditor({ value, onChange }) {
  const [groups, setGroups] = useState(() => (Array.isArray(value) ? value : []));
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [grouped, setGrouped] = useState(null);
  const [picks, setPicks] = useState({});
  const [customs, setCustoms] = useState({});

  // The parent form owns the value; mirror it in without looping.
  useEffect(() => {
    setGroups(Array.isArray(value) ? value : []);
  }, [value]);

  useEffect(() => {
    (async () => {
      const sb = getSupabase();
      if (!sb) return;
      const groupOk = await supportsTechGroups(sb);
      setGrouped(groupOk);
      const [tagRes, catRes] = await Promise.all([
        sb.from("portfolio_tags").select("id,name,icon"),
        groupOk
          ? sb.from(CATEGORIES_TABLE).select("id,name,sort_order").order("sort_order", { ascending: true })
          : Promise.resolve({ data: [] }),
      ]);
      // Alphabetical, case-insensitive, so the dropdown reads a -> z instead of
      // Icons-table sort_order. Categories keep their own sort_order.
      if (tagRes.data)
        setTags(
          tagRes.data
            .filter((t) => t.name)
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
        );
      setCategories(catRes.data || []);
    })();
  }, []);

  // Categories cannot be assigned until the migration is applied. Say so
  // rather than accepting edits that would be dropped on save.
  if (grouped === false) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200">
        Technology Stack category ব্যবহারের জন্য প্রথমে DB migration চালাও:{" "}
        <code className="text-amber-100">supabase/migrations/20260101_add_tech_categories.sql</code> — Supabase
        Dashboard → SQL Editor-এ চালালে এখানে category বাছাই করার সুবিধা চালু হবে। তার আগে existing technology
        list ঠিক আছে, শুধু category grouping ব্যবহার করা যাবে না।
      </div>
    );
  }

  const emit = (next) => {
    setGroups(next);
    onChange(next);
  };

  const setTechnologies = (gi, techs) => {
    emit(groups.map((g, i) => (i === gi ? { ...g, technologies: techs } : g)));
  };

  // Keeps only groups that still hold at least one technology, so the store
  // never writes an empty category back out.
  const emitGroups = (next) => emit(next.filter((g) => (g.technologies || []).length > 0));

  const addTo = (catId, tech) => {
    const existing = groups.findIndex((g) => g.id === catId);
    const cat = categories.find((c) => c.id === catId);
    if (!cat || !clean(tech.name)) return;
    const base = existing >= 0 ? groups[existing].technologies || [] : [];
    const dup = base.some((t) => clean(t.name).toLowerCase() === clean(tech.name).toLowerCase());
    if (dup) return;
    const row = { name: clean(tech.name), icon: tech.icon || "", tag_id: tech.tag_id || null };
    if (existing >= 0) {
      emit(groups.map((g, i) => (i === existing ? { ...g, technologies: [...base, row] } : g)));
    } else {
      emit([...groups, { id: catId, name: cat.name, technologies: [row] }]);
    }
  };

  const moveGroup = (gi, dir) => {
    const to = gi + dir;
    if (to < 0 || to >= groups.length) return;
    const next = [...groups];
    [next[gi], next[to]] = [next[to], next[gi]];
    emit(next);
  };

  const editTechnology = (gi, ti, patch) => {
    const techs = [...(groups[gi].technologies || [])];
    techs[ti] = { ...techs[ti], ...patch };
    setTechnologies(gi, techs);
  };

  // Moves a technology out of the uncategorised bucket into a real category,
  // refusing when the target already holds something with the same name.
  const moveToCategory = (gi, ti, catId) => {
    const cat = categories.find((c) => c.id === catId);
    const src = groups[gi]?.technologies?.[ti];
    if (!cat || !src) return;
    const key = clean(src.name).toLowerCase();
    const targetIdx = groups.findIndex((g) => g.id === catId);
    if (targetIdx >= 0 && (groups[targetIdx].technologies || []).some((t) => clean(t.name).toLowerCase() === key)) return;
    const without = groups
      .map((g, i) => (i === gi ? { ...g, technologies: g.technologies.filter((_, x) => x !== ti) } : g))
      .filter((g) => (g.technologies || []).length > 0);
    if (targetIdx < 0) emit([...without, { id: catId, name: cat.name, technologies: [src] }]);
    else {
      const ni = without.findIndex((g) => g.id === catId);
      emit(without.map((g, i) => (i === ni ? { ...g, technologies: [...(g.technologies || []), src] } : g)));
    }
  };

  const deleteTechnology = (gi, ti) => {
    emitGroups(groups.map((g, i) => (i === gi ? { ...g, technologies: g.technologies.filter((_, x) => x !== ti) } : g)));
  };

  const moveTechnology = (gi, ti, dir) => {
    const techs = [...(groups[gi].technologies || [])];
    const to = ti + dir;
    if (to < 0 || to >= techs.length) return;
    [techs[ti], techs[to]] = [techs[to], techs[ti]];
    setTechnologies(gi, techs);
  };

  const order = categories.map((c) => c.id);

  return (
    <div className="space-y-3">
      <p className={hintCls}>
        প্রথমে <strong>Tech Categories</strong> section থেকে category বানাও (নাম + order)। এখানে শুধু প্রতিটি
        technology-কে category-তে বাছাই করা হয়, UUID দিয়ে link হয়। Category-র order ও technology-র order-ও
        ঠিক করা যায়। যোগ করার সময় icon ই ঠিক হয়ে যায় — <strong>Icons</strong> section-এর tag থেকে নিলে সেই
        tag-এর URL চলে আসে, নিজে URL দিলে সেটাই বসে।
      </p>

      {categories.length === 0 && grouped === true ? (
        <p className="text-xs text-zinc-500">
          কোনো category নেই। Admin → Tech Categories থেকে প্রথমে category তৈরি করো।
        </p>
      ) : null}

      {categories.map((cat) => {
        const gi = groups.findIndex((g) => g.id === cat.id);
        const techs = gi >= 0 ? groups[gi].technologies || [] : [];
        const pick = picks[cat.id] || "";
        const draft = customs[cat.id] || {};
        const used = new Set(techs.map((t) => clean(t.name).toLowerCase()));
        const available = tags.filter((t) => !used.has(clean(t.name).toLowerCase()));

        return (
          <div key={cat.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
            {/* Category header — position comes from the global category order */}
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{cat.name || "(নামহীন)"}</h4>
              <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-xs text-zinc-400">
                {techs.length}
              </span>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => moveGroup(gi, -1)}
                  disabled={gi < 0 || order.indexOf(cat.id) === 0}
                  aria-label={`Move ${cat.name} up`}
                  className="rounded-md border border-white/10 px-2 py-1 text-xs hover:bg-white/10 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveGroup(gi, 1)}
                  disabled={gi < 0 || order.indexOf(cat.id) === order.length - 1}
                  aria-label={`Move ${cat.name} down`}
                  className="rounded-md border border-white/10 px-2 py-1 text-xs hover:bg-white/10 disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
            </div>

            {/* Technologies in this category */}
            <div className="mt-3 space-y-2">
              {techs.length === 0 ? (
                <p className="text-xs text-zinc-500">এই category-তে এখনো কোনো technology যোগ করা হয়নি।</p>
              ) : null}

              {techs.map((t, ti) => (
                <div key={`${cat.id}-${ti}`} className="flex flex-wrap items-center gap-2 rounded-md border border-white/10 bg-black/30 p-2">
                  {t.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.icon} alt="" width={18} height={18} className="h-[18px] w-[18px] shrink-0 object-contain" />
                  ) : (
                    <span className="h-[18px] w-[18px] shrink-0 rounded border border-white/10" />
                  )}

                  <input
                    value={t.name || ""}
                    onChange={(e) => editTechnology(gi, ti, { name: e.target.value, tag_id: null })}
                    placeholder="Technology name"
                    className="min-w-32 flex-1 rounded-md border border-white/10 bg-black/40 p-1.5 text-sm text-white outline-none focus:border-blue-400"
                  />

                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => moveTechnology(gi, ti, -1)}
                      disabled={ti === 0}
                      aria-label={`Move ${t.name} up`}
                      className="rounded-md border border-white/10 px-2 py-1 text-xs hover:bg-white/10 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveTechnology(gi, ti, 1)}
                      disabled={ti === techs.length - 1}
                      aria-label={`Move ${t.name} down`}
                      className="rounded-md border border-white/10 px-2 py-1 text-xs hover:bg-white/10 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTechnology(gi, ti)}
                      aria-label={`Delete ${t.name}`}
                      className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              {/* Add technology: from Icons table, or custom name + icon URL */}
              <div className="flex gap-2">
                <select
                  value={pick}
                  onChange={(e) => setPicks((p) => ({ ...p, [cat.id]: e.target.value }))}
                  className={`${inputCls} min-w-0 flex-1 [color-scheme:dark]`}
                >
                  <option value="" className="bg-zinc-900 text-white">
                    — Icons table theke technology —
                  </option>
                  {available.map((x) => (
                    <option key={x.id} value={x.id} className="bg-zinc-900 text-white">
                      {x.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const tag = tags.find((x) => x.id === pick);
                    if (tag) addTo(cat.id, { name: tag.name, icon: tag.icon || "", tag_id: tag.id });
                    setPicks((p) => ({ ...p, [cat.id]: "" }));
                  }}
                  disabled={!pick}
                  className="mt-2 shrink-0 rounded-lg border border-white/15 px-3 text-sm hover:bg-white/10 disabled:opacity-40"
                >
                  Add
                </button>
              </div>

              <details className="text-xs">
                <summary className="cursor-pointer text-zinc-400 hover:text-zinc-200">
                  নিজে technology + icon URL দিয়ে যোগ করো
                </summary>
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    value={draft.name || ""}
                    onChange={(e) => setCustoms((c) => ({ ...c, [cat.id]: { ...draft, name: e.target.value } }))}
                    placeholder="Technology name"
                    className="min-w-32 flex-1 rounded-md border border-white/10 bg-black/40 p-1.5 text-sm text-white outline-none focus:border-blue-400"
                  />
                  <input
                    value={draft.icon || ""}
                    onChange={(e) => setCustoms((c) => ({ ...c, [cat.id]: { ...draft, icon: e.target.value } }))}
                    placeholder="Icon URL (optional)"
                    className="min-w-32 flex-1 rounded-md border border-white/10 bg-black/40 p-1.5 text-sm text-white outline-none focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addTo(cat.id, { name: draft.name, icon: draft.icon, tag_id: null });
                      setCustoms((c) => ({ ...c, [cat.id]: {} }));
                    }}
                    disabled={!clean(draft.name)}
                    className="shrink-0 rounded-md border border-white/15 px-3 text-sm hover:bg-white/10 disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </details>
            </div>
          </div>
        );
      })}

      {/* Uncategorized bucket: technologies the admin has not filed yet. The
          public page does not render these; here they can be filed or deleted. */}
      {groups.map((g, gi) =>
        g.id === null && (g.technologies || []).length > 0 ? (
          <div key={`loose-${gi}`} className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="min-w-0 flex-1 truncate text-sm font-semibold text-amber-200">
                Uncategorized
              </h4>
              <span className="shrink-0 rounded-full border border-amber-500/30 px-2 py-0.5 text-xs text-amber-200">
                {(g.technologies || []).length}
              </span>
            </div>
            <p className="mt-1 text-xs text-amber-200/70">
              এগুলো category-তে ঢোকানো হয়নি, তাই public page-এ দেখাচ্ছে না। Category বেছে নাও অথবা × দিয়ে মুছে ফেলো।
            </p>

            <div className="mt-3 space-y-2">
              {(g.technologies || []).map((t, ti) => (
                <div key={ti} className="flex flex-wrap items-center gap-2 rounded-md border border-white/10 bg-black/30 p-2">
                  {t.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.icon} alt="" width={18} height={18} className="h-[18px] w-[18px] shrink-0 object-contain" />
                  ) : (
                    <span className="h-[18px] w-[18px] shrink-0 rounded border border-white/10" />
                  )}

                  <input
                    value={t.name || ""}
                    onChange={(e) => editTechnology(gi, ti, { name: e.target.value, tag_id: null })}
                    placeholder="Technology name"
                    className="min-w-32 flex-1 rounded-md border border-white/10 bg-black/40 p-1.5 text-sm text-white outline-none focus:border-blue-400"
                  />

                  <select
                    value=""
                    onChange={(e) => moveToCategory(gi, ti, e.target.value)}
                    className="rounded-md border border-white/10 bg-black/40 p-1.5 text-xs text-white outline-none focus:border-blue-400 [color-scheme:dark]"
                  >
                    <option value="" className="bg-zinc-900 text-white">
                      — category-তে নাও —
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-zinc-900 text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => deleteTechnology(gi, ti)}
                    aria-label={`Delete ${t.name}`}
                    className="shrink-0 rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}