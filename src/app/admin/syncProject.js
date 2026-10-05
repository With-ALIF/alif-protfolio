import { getSupabase } from "@/lib/supabase";
import { loadProjectOptions, loadProjects } from "./store/projects";
import { loadDetails, saveDetail } from "./store/details";

// After a project is saved, mirror card fields into its details row
// so the details page (/projects/[slug]) stays in sync automatically.
export async function saveProjectAndSync(s, activeName) {
  if (activeName !== "alif_projects") {
    await s.handleSave();
    return;
  }
  const snapshot = { ...s.form };
  const wasNew = s.isNew;
  const prevId = s.editing?.id;
  await s.handleSave();
  try {
    const sb = getSupabase();
    let pid = prevId;
    if (!pid && wasNew && snapshot.slug) {
      const { data } = await loadProjectOptions(sb);
      pid = (data || []).find((p) => p.slug === snapshot.slug)?.id;
    }
    if (!pid) return;
    const { data: details, error } = await loadDetails(sb, "slug");
    if (error) throw error;
    const match = (details || []).find((d) => d.project_id === pid);
    // Details' Short description is read-only in the admin, so it is always
    // (re)synced from the project's description.
    const summary = snapshot.description || "";
    const card = {
      title: snapshot.title || "",
      slug: snapshot.slug || "",
      description: summary,
      thumbnail_url: snapshot.image || "",
    };
    if (Array.isArray(snapshot.tags)) card.tags = snapshot.tags;
    if (!match) {
      if (!card.slug) {
        s.setNotice?.("Saved project. Add a slug, save again, and its Details row will be created.");
        return;
      }
      const c = await saveDetail(sb, null, { ...card, project_id: pid });
      if (c.error) throw c.error;
      s.setNotice?.("Saved project + Details row created.");
      return;
    }
    const r = await saveDetail(sb, match.id, {
      ...match,
      title: snapshot.title || "",
      slug: snapshot.slug || "",
      description: summary,
      thumbnail_url: snapshot.image || "",
      tags: snapshot.tags,
    });
    if (r.error) throw r.error;
    s.setNotice?.("Saved project + details synced.");
  } catch (e) {
    s.setNotice?.(`Saved project. Details sync failed: ${e.message}`);
  }
}

// One-time backfill: copy card fields of ALL projects into matching details rows.
export async function syncAllProjectsToDetails(s) {
  const sb = getSupabase();
  if (!sb) return;
  s.setNotice?.("Syncing all projects to details...");
  const { data: projects, error: e1 } = await loadProjects(sb, "sort_order");
  const { data: details, error: e2 } = await loadDetails(sb, "slug");
  if (e1 || e2 || !projects || !details) {
    s.setNotice?.("Sync failed: could not load data.");
    return;
  }
  const byProject = new Map(details.map((d) => [d.project_id, d.id]));
  const rowById = new Map(details.map((d) => [d.id, d]));
  let n = 0;
  for (const p of projects || []) {
    const did = byProject.get(p.id);
    if (!did) continue;
    const m = rowById.get(did);
    const { error } = await saveDetail(sb, did, {
      ...m,
      title: p.title || "",
      slug: p.slug || "",
      description: p.description || "",
      thumbnail_url: p.image || "",
      tags: p.tags || [],
    });
    if (error) {
      s.setNotice?.(`Sync failed: ${error.message}`);
      return;
    }
    n++;
  }
  s.setNotice?.(`Synced ${n} projects to details.`);
}
