import { replaceProjectTags, tagsByProject, supportsTagId, supportsTechGroups } from "./tags";

const COLS = ["project_id", "slug", "title", "description", "full_description", "github_url", "demo_url", "thumbnail_url", "status", "featured", "show_database", "show_github", "show_demo"];
const pick = (src) => ({ ...Object.fromEntries(COLS.map((k) => [k, src?.[k] ?? null])), project_id: src?.project_id || null });

const arr = (v) => (Array.isArray(v) ? v : []);
const bodies = (rows) => (rows || []).map((r) => r.body || "");

const CHILD_TABLES = ["technologies", "features", "gallery", "timeline", "challenges", "solutions", "statistics"];
const TECH_CATEGORIES = "portfolio_tech_categories";

// One request per child table covering ALL details rows, in parallel.
// The previous per-row version cost 1 + 8N serial round trips.
async function childrenByDetail(sb, ids, grouped) {
  const requests = [
    ...CHILD_TABLES.map((t) =>
      sb.from(`portfolio_detail_${t}`).select("*").in("detail_id", ids).order("sort_order", { ascending: true })
    ),
    sb.from("portfolio_detail_database").select("*").in("detail_id", ids),
  ];
  // The global category list is only fetched once the migration exists; a
  // missing table must not take the whole Project Details list down with it.
  if (grouped)
    requests.push(sb.from(TECH_CATEGORIES).select("id,name,sort_order").order("sort_order", { ascending: true }));
  const results = await Promise.all(requests);
  const out = {};
  for (let i = 0; i < CHILD_TABLES.length; i++) {
    if (results[i].error) return { out: null, error: results[i].error };
    out[CHILD_TABLES[i]] = results[i].data || [];
  }
  const db = results[CHILD_TABLES.length];
  if (db.error) return { out: null, error: db.error };
  out.database = db.data || [];
  out.techCategories = grouped ? results[CHILD_TABLES.length + 1]?.data || [] : [];
  return { out, error: null };
}

const groupByDetail = (rows) => {
  const m = {};
  for (const r of rows || []) (m[r.detail_id] = m[r.detail_id] || []).push(r);
  return m;
};

export async function loadDetails(sb, orderBy) {
  const [d, t, g, grouped] = await Promise.all([
    sb.from("portfolio_project_details").select("*").order(orderBy || "slug", { ascending: true }),
    tagsByProject(sb),
    sb.from("portfolio_tags").select("id,icon"),
    supportsTechGroups(sb),
  ]);
  if (d.error) return { data: null, error: d.error };
  if (t.error) return { data: null, error: t.error };
  // Live tag icons: admin previews follow tag URL changes immediately.
  const live = {};
  if (!g.error) for (const r of g.data || []) if (r.id) live[r.id] = r.icon || "";
  const parents = d.data || [];
  if (parents.length === 0) return { data: [], error: null };
  const c = await childrenByDetail(sb, parents.map((r) => r.id), grouped);
  if (c.error) return { data: null, error: c.error };
  const by = {};
  for (const table of CHILD_TABLES) by[table] = groupByDetail(c.out[table]);
  const dbBy = {};
  for (const r of c.out.database) dbBy[r.detail_id] = r;
  const techIcon = (x) => (x.tag_id && live[x.tag_id]) || x.icon || "";
  const rows = [];
  for (const r of parents) {
    const stats = {};
    for (const s of by.statistics[r.id] || []) if (s.label) stats[s.label] = s.value ?? "";
    const db = dbBy[r.id];
    const techRows = by.technologies[r.id] || [];
    // Categories are global: every category is listed, and the ones this
    // project actually uses carry its technologies. Uncategorized rows land in
    // a trailing unnamed group so nothing is hidden until an admin files it.
    const categories = (c.out.techCategories || []).map((cat) => ({
      id: cat.id,
      name: cat.name || "",
      technologies: techRows
        .filter((t) => t.category_id === cat.id)
        .map((t) => ({ id: t.id, name: t.name || "", icon: techIcon(t), tag_id: t.tag_id || null })),
    }));
    const loose = techRows
      .filter((t) => !t.category_id || !categories.some((c) => c.id === t.category_id))
      .map((t) => ({ id: t.id, name: t.name || "", icon: techIcon(t), tag_id: t.tag_id || null }));
    if (loose.length > 0) categories.push({ id: null, name: "", technologies: loose });
    rows.push({
      ...r,
      tags: r.project_id ? t.map[r.project_id] || [] : [],
      tech_categories: categories,
      technologies: techRows.map((t) => ({ name: t.name || "", icon: techIcon(t), tag_id: t.tag_id || null })),
      features: bodies(by.features[r.id]),
      gallery: (by.gallery[r.id] || []).map((x) => ({ title: x.title || "", image: x.image_url || "" })),
      timeline: (by.timeline[r.id] || []).map((x) => ({ date: x.date || "", title: x.title || "", detail: x.detail || "" })),
      challenges: bodies(by.challenges[r.id]),
      solutions: bodies(by.solutions[r.id]),
      statistics: stats,
      database_info: db
        ? {
            name: db.name || "",
            icon: (db.tag_id && live[db.tag_id]) || db.icon || "",
            description: db.description || "",
            tag_id: db.tag_id || null,
          }
        : null,
    });
  }
  return { data: rows, error: null };
}

async function replaceChildren(sb, did, payload) {
  const [techTagOk, dbTagOk, grouped] = await Promise.all([
    supportsTagId(sb, "portfolio_detail_technologies"),
    supportsTagId(sb, "portfolio_detail_database"),
    supportsTechGroups(sb),
  ]);
  const put = async (key, table, mapFn) => {
    const del = await sb.from(table).delete().eq("detail_id", did);
    if (del.error) return del;
    const rows = arr(payload?.[key]).map((v, i) => ({ detail_id: did, ...mapFn(v, i) }));
    if (rows.length === 0) return { error: null };
    return sb.from(table).insert(rows);
  };
  const steps = [
    put("features", "portfolio_detail_features", (x, i) => ({ body: String(x ?? ""), sort_order: i })),
    put("gallery", "portfolio_detail_gallery", (x, i) => ({ title: x?.title || "", image_url: x?.image || "", sort_order: i })),
    put("timeline", "portfolio_detail_timeline", (x, i) => ({ date: x?.date || "", title: x?.title || "", detail: x?.detail || "", sort_order: i })),
    put("challenges", "portfolio_detail_challenges", (x, i) => ({ body: String(x ?? ""), sort_order: i })),
    put("solutions", "portfolio_detail_solutions", (x, i) => ({ body: String(x ?? ""), sort_order: i })),
  ];
  for (const s of steps) {
    const r = await s;
    if (r.error) return r;
  }

  // Technology Stack: categories first so technologies can point at them.
  // When the grouping migration is not applied yet, the flat list is written
  // to the same place as before so nothing is lost.
  if (grouped) {
    const techStep = await replaceTechStack(sb, did, payload?.tech_categories, techTagOk);
    if (techStep.error) return techStep;
  } else {
    const r = await put(
      "technologies",
      "portfolio_detail_technologies",
      (x, i) => ({
        name: x?.name || "",
        icon: x?.icon || "",
        ...(techTagOk ? { tag_id: x?.tag_id || null } : {}),
        sort_order: i,
      })
    );
    const w = await r;
    if (w.error) return w;
  }

  const stats = payload?.statistics && typeof payload.statistics === "object" ? Object.entries(payload.statistics) : [];
  const sd = await sb.from("portfolio_detail_statistics").delete().eq("detail_id", did);
  if (sd.error) return sd;
  if (stats.length > 0) {
    const ins = await sb.from("portfolio_detail_statistics").insert(stats.map(([label, value], i) => ({ detail_id: did, label, value: value ?? "", sort_order: i })));
    if (ins.error) return ins;
  }
  const db = payload?.database_info || {};
  const dd = await sb.from("portfolio_detail_database").delete().eq("detail_id", did);
  if (dd.error) return dd;
  if (db.name || db.icon || db.description) {
    const ins = await sb.from("portfolio_detail_database").insert({
      detail_id: did,
      name: db.name || "",
      icon: db.icon || "",
      description: db.description || "",
      ...(dbTagOk ? { tag_id: db.tag_id || null } : {}),
    });
    if (ins.error) return ins;
  }
  return { error: null };
}

// Replaces the technologies of one project, pointing each row at an existing
// global category by UUID. The categories table itself is never written here:
// it is owned by the "Tech Categories" admin section, so a project save can
// never create, rename, reorder or delete a shared category.
async function replaceTechStack(sb, did, groups, techTagOk) {
  const del = await sb.from("portfolio_detail_technologies").delete().eq("detail_id", did);
  if (del.error) return del;

  const rows = [];
  for (const g of arr(groups)) {
    // A null id is the "uncategorised" bucket the loader produces.
    const categoryId = g?.id || null;
    arr(g?.technologies).forEach((t, i) => {
      rows.push({
        detail_id: did,
        category_id: categoryId,
        name: String(t?.name ?? "").trim(),
        icon: t?.icon || "",
        ...(techTagOk ? { tag_id: t?.tag_id || null } : {}),
        sort_order: i,
      });
    });
  }
  if (rows.length === 0) return { error: null };
  const ins = await sb.from("portfolio_detail_technologies").insert(rows);
  if (ins.error) return ins;
  return { error: null };
}

export async function saveDetail(sb, id, payload) {
  const cols = pick(payload);
  let did = id;
  if (id) {
    const up = await sb.from("portfolio_project_details").update(cols).eq("id", id);
    if (up.error) return { error: up.error, id };
  } else {
    const ins = await sb.from("portfolio_project_details").insert(cols).select("id").single();
    if (ins.error) return { error: ins.error, id };
    did = ins.data.id;
  }
  const c = await replaceChildren(sb, did, payload);
  if (c.error) return { error: c.error, id: did };
  if (payload && "tags" in payload) {
    const t = await replaceProjectTags(sb, cols.project_id, payload.tags);
    if (t.error) return { error: t.error, id: did };
  }
  return { error: null, id: did };
}

export async function removeDetail(sb, id) {
  // FK cascades remove child rows.
  return sb.from("portfolio_project_details").delete().eq("id", id);
}
