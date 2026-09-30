// Virtual alif_* tables backed by portfolio_* tables.
// UI code keeps the exact old shapes; only this store touches Supabase.
import { loadSiteRows, saveSiteSection } from "./site";
import { loadProjects, saveProject, removeProject, loadProjectOptions } from "./projects";
import { loadDetails, saveDetail, removeDetail } from "./details";
import { supportsTagId } from "./tags";

const DIRECT = {
  alif_skills: "portfolio_skills",
  alif_tools: "portfolio_tools",
  alif_tag: "portfolio_tags",
  alif_education: "portfolio_education",
  alif_experience: "portfolio_experience",
  alif_services: "portfolio_services",
  alif_reviews: "portfolio_reviews",
  alif_journey: "portfolio_journey",
};

export function loadRows(sb, name, orderBy) {
  if (DIRECT[name]) return sb.from(DIRECT[name]).select("*").order(orderBy, { ascending: true });
  if (name === "alif_site_content") return loadSiteRows(sb);
  if (name === "alif_projects") return loadProjects(sb, orderBy);
  if (name === "alif_project_details") return loadDetails(sb, orderBy);
  return { data: [], error: new Error(`Unknown table: ${name}`) };
}

// Drops tag_id from the payload when the column hasn't been migrated yet,
// so saves keep working before/after the migration in any order.
async function withoutTagId(sb, table, payload) {
  if (!payload || !("tag_id" in payload)) return payload;
  if (await supportsTagId(sb, table)) return payload;
  const { tag_id, ...rest } = payload;
  return rest;
}

export async function insertRow(sb, name, payload) {
  if (DIRECT[name]) return sb.from(DIRECT[name]).insert(await withoutTagId(sb, DIRECT[name], payload));
  if (name === "alif_site_content") return saveSiteSection(sb, payload.section, payload.data);
  if (name === "alif_projects") return saveProject(sb, null, payload);
  if (name === "alif_project_details") return saveDetail(sb, null, payload);
  return { error: new Error(`Unknown table: ${name}`) };
}

export async function updateRow(sb, name, id, payload) {
  if (DIRECT[name]) return sb.from(DIRECT[name]).update(await withoutTagId(sb, DIRECT[name], payload)).eq("id", id);
  if (name === "alif_site_content") return saveSiteSection(sb, payload.section, payload.data);
  if (name === "alif_projects") return saveProject(sb, id, payload);
  if (name === "alif_project_details") return saveDetail(sb, id, payload);
  return { error: new Error(`Unknown table: ${name}`) };
}

export async function deleteRow(sb, name, row) {
  if (DIRECT[name]) return sb.from(DIRECT[name]).delete().eq("id", row.id);
  if (name === "alif_projects") return removeProject(sb, row.id);
  if (name === "alif_project_details") return removeDetail(sb, row.id);
  return { error: null }; // site sections are protected in UI
}

// Tables that keep their own copy of a tag icon URL.
const ICON_REF_TABLES = [
  "portfolio_skills",
  "portfolio_tools",
  "portfolio_detail_technologies",
  "portfolio_detail_database",
];

// Push a changed Icons-table URL into every copy. Returns updated row count.
export async function cascadeIconUrl(sb, oldUrl, newUrl) {
  const from = String(oldUrl || "").trim();
  const to = String(newUrl || "").trim();
  if (!from || !to || from === to) return { updated: 0, error: null };
  let updated = 0;
  for (const t of ICON_REF_TABLES) {
    const r = await sb.from(t).update({ icon: to }).eq("icon", from).select("id");
    if (r.error) return { updated, error: r.error };
    updated += (r.data || []).length;
  }
  return { updated, error: null };
}

export { loadProjectOptions };
