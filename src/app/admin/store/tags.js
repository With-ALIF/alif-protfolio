// Tag junction helpers: portfolio_project_tags <-> portfolio_tags.
export async function ensureTagIds(sb, names) {
  const clean = [...new Set((names || []).map((n) => String(n || "").trim()).filter(Boolean))];
  if (clean.length === 0) return { ids: [], error: null };
  const { data, error } = await sb.from("portfolio_tags").select("id,name");
  if (error) return { ids: [], error };
  const byName = new Map((data || []).map((t) => [t.name, t.id]));
  for (const n of clean) {
    if (byName.has(n)) continue;
    const { data: ins, error: e2 } = await sb.from("portfolio_tags").insert({ name: n }).select("id").single();
    if (e2) return { ids: [], error: e2 };
    byName.set(n, ins.id);
  }
  return { ids: clean.map((n) => byName.get(n)), error: null };
}

export async function replaceProjectTags(sb, projectId, names) {
  if (!projectId) return { error: null };
  const del = await sb.from("portfolio_project_tags").delete().eq("project_id", projectId);
  if (del.error) return del;
  const { ids, error } = await ensureTagIds(sb, names);
  if (error) return { error };
  if (ids.length === 0) return { error: null };
  return sb.from("portfolio_project_tags").insert(ids.map((tag_id) => ({ project_id: projectId, tag_id })));
}

export async function tagsByProject(sb) {
  const a = await sb.from("portfolio_tags").select("id,name");
  if (a.error) return { map: {}, error: a.error };
  const b = await sb.from("portfolio_project_tags").select("project_id,tag_id");
  if (b.error) return { map: {}, error: b.error };
  const nameById = Object.fromEntries((a.data || []).map((t) => [t.id, t.name]));
  const map = {};
  for (const l of b.data || []) (map[l.project_id] = map[l.project_id] || []).push(nameById[l.tag_id] || "");
  return { map, error: null };
}

// Probes (once per table per session) whether the tag_id FK column exists.
// Lets the admin keep working before the migration below has been applied:
//   alter table X add column tag_id uuid references portfolio_tags(id) on delete set null;
const tagIdSupport = {};
export async function supportsTagId(sb, table) {
  if (tagIdSupport[table] !== undefined) return tagIdSupport[table];
  try {
    const r = await sb.from(table).select("tag_id").limit(1);
    // Only a missing-column error means "migration not applied yet".
    // Any other error (network, RLS) must NOT be masked: assume supported.
    tagIdSupport[table] = !r.error || !String(r.error.message || "").includes("tag_id");
  } catch {
    tagIdSupport[table] = true;
  }
  return tagIdSupport[table];
}
