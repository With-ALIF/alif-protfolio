// Virtual alif_projects rows <-> portfolio_projects + tag junction.
import { replaceProjectTags, tagsByProject } from "./tags";

const COLS = ["title", "slug", "short_description", "description", "image", "github", "demo", "featured", "is_published", "show_github", "sort_order"];
const pick = (src) => Object.fromEntries(COLS.map((k) => [k, src?.[k]]));

export async function loadProjects(sb, orderBy) {
  const [p, t] = await Promise.all([
    sb.from("portfolio_projects").select("*").order(orderBy || "sort_order", { ascending: true }),
    tagsByProject(sb),
  ]);
  if (p.error) return { data: null, error: p.error };
  if (t.error) return { data: null, error: t.error };
  return { data: (p.data || []).map((r) => ({ ...r, tags: t.map[r.id] || [] })), error: null };
}

export async function saveProject(sb, id, payload) {
  const cols = pick(payload);
  let pid = id;
  if (id) {
    const up = await sb.from("portfolio_projects").update(cols).eq("id", id);
    if (up.error) return { error: up.error, id };
  } else {
    const ins = await sb.from("portfolio_projects").insert(cols).select("id").single();
    if (ins.error) return { error: ins.error, id };
    pid = ins.data.id;
  }
  const t = payload && "tags" in payload
    ? await replaceProjectTags(sb, pid, payload.tags)
    : { error: null };
  return { error: t.error, id: pid };
}

export async function removeProject(sb, id) {
  // FK cascades remove details + tag links.
  return sb.from("portfolio_projects").delete().eq("id", id);
}

export async function loadProjectOptions(sb) {
  const { data, error } = await sb.from("portfolio_projects").select("id,title,slug").order("sort_order", { ascending: true });
  return { data: data || [], error };
}
