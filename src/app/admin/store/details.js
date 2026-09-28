import { replaceProjectTags, tagsByProject } from "./tags";

const COLS = ["project_id", "slug", "title", "description", "full_description", "github_url", "demo_url", "thumbnail_url", "status", "featured", "show_database", "show_github", "show_demo"];
const pick = (src) => ({ ...Object.fromEntries(COLS.map((k) => [k, src?.[k] ?? null])), project_id: src?.project_id || null });

const arr = (v) => (Array.isArray(v) ? v : []);
const bodies = (rows) => (rows || []).map((r) => r.body || "");

async function children(sb, detailId) {
  const tables = ["technologies", "features", "gallery", "timeline", "challenges", "solutions", "statistics"];
  const out = {};
  for (const t of tables) {
    const r = await sb.from(`portfolio_detail_${t}`).select("*").eq("detail_id", detailId).order("sort_order", { ascending: true });
    if (r.error) return { out: null, error: r.error };
    out[t] = r.data || [];
  }
  const db = await sb.from("portfolio_detail_database").select("*").eq("detail_id", detailId).maybeSingle();
  if (db.error) return { out: null, error: db.error };
  out.database = db.data || null;
  return { out, error: null };
}

export async function loadDetails(sb, orderBy) {
  const d = await sb.from("portfolio_project_details").select("*").order(orderBy || "slug", { ascending: true });
  if (d.error) return { data: null, error: d.error };
  const t = await tagsByProject(sb);
  if (t.error) return { data: null, error: t.error };
  const rows = [];
  for (const r of d.data || []) {
    const c = await children(sb, r.id);
    if (c.error) return { data: null, error: c.error };
    const stats = {};
    for (const s of c.out.statistics) if (s.label) stats[s.label] = s.value ?? "";
    rows.push({
      ...r,
      tags: r.project_id ? t.map[r.project_id] || [] : [],
      technologies: (c.out.technologies || []).map((x) => ({ name: x.name || "", icon: x.icon || "" })),
      features: bodies(c.out.features),
      gallery: (c.out.gallery || []).map((x) => ({ title: x.title || "", image: x.image_url || "" })),
      timeline: (c.out.timeline || []).map((x) => ({ date: x.date || "", title: x.title || "", detail: x.detail || "" })),
      challenges: bodies(c.out.challenges),
      solutions: bodies(c.out.solutions),
      statistics: stats,
      database_info: c.out.database ? { name: c.out.database.name || "", icon: c.out.database.icon || "", description: c.out.database.description || "" } : null,
    });
  }
  return { data: rows, error: null };
}

async function replaceChildren(sb, did, payload) {
  const put = async (key, table, mapFn) => {
    const del = await sb.from(table).delete().eq("detail_id", did);
    if (del.error) return del;
    const rows = arr(payload?.[key]).map((v, i) => ({ detail_id: did, ...mapFn(v, i) }));
    if (rows.length === 0) return { error: null };
    return sb.from(table).insert(rows);
  };
  const steps = [
    put("technologies", "portfolio_detail_technologies", (x, i) => ({ name: x?.name || "", icon: x?.icon || "", sort_order: i })),
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
    const ins = await sb.from("portfolio_detail_database").insert({ detail_id: did, name: db.name || "", icon: db.icon || "", description: db.description || "" });
    if (ins.error) return ins;
  }
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
