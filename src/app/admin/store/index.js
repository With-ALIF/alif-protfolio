// Virtual alif_* tables backed by portfolio_* tables.
// UI code keeps the exact old shapes; only this store touches Supabase.
import { loadSiteRows, saveSiteSection } from "./site";
import { loadProjects, saveProject, removeProject, loadProjectOptions } from "./projects";
import { loadDetails, saveDetail, removeDetail } from "./details";

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

export async function insertRow(sb, name, payload) {
  if (DIRECT[name]) return sb.from(DIRECT[name]).insert(payload);
  if (name === "alif_site_content") return saveSiteSection(sb, payload.section, payload.data);
  if (name === "alif_projects") return saveProject(sb, null, payload);
  if (name === "alif_project_details") return saveDetail(sb, null, payload);
  return { error: new Error(`Unknown table: ${name}`) };
}

export async function updateRow(sb, name, id, payload) {
  if (DIRECT[name]) return sb.from(DIRECT[name]).update(payload).eq("id", id);
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

export { loadProjectOptions };
