import { getSupabase } from "@/lib/supabase";

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
      const { data } = await sb.from("alif_projects").select("id").eq("slug", snapshot.slug).maybeSingle();
      pid = data?.id;
    }
    if (!pid) return;
    const { data: existing } = await sb.from("alif_project_details").select("id").eq("project_id", pid).maybeSingle();
    if (!existing) return;
    const { error } = await sb.from("alif_project_details").update({
      title: snapshot.title || "",
      slug: snapshot.slug || "",
      description: snapshot.description || "",
      thumbnail_url: snapshot.image || "",
      tags: Array.isArray(snapshot.tags) ? snapshot.tags : [],
    }).eq("project_id", pid);
    if (error) throw error;
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
  const { data: projects } = await sb.from("alif_projects").select("id,slug,title,description,image,tags");
  const { data: details } = await sb.from("alif_project_details").select("id,project_id");
  if (!projects || !details) {
    s.setNotice?.("Sync failed: could not load data.");
    return;
  }
  const detailIdByProject = new Map(details.map((d) => [d.project_id, d.id]));
  let n = 0;
  for (const p of projects || []) {
    const did = detailIdByProject.get(p.id);
    if (!did) continue;
    const { error } = await sb.from("alif_project_details").update({
      title: p.title || "",
      slug: p.slug || "",
      description: p.description || "",
      thumbnail_url: p.image || "",
      tags: Array.isArray(p.tags) ? p.tags : [],
    }).eq("id", did);
    if (error) {
      s.setNotice?.(`Sync failed: ${error.message}`);
      return;
    }
    n++;
  }
  s.setNotice?.(`Synced ${n} projects to details.`);
}
