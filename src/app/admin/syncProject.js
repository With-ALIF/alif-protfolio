import { getSupabase } from "@/lib/supabase";
import { loadProjectOptions, loadProjects } from "./store/projects";
import { loadDetails, saveDetail } from "./store/details";

export async function saveProjectAndSync(s, activeName) {
  if (activeName === "alif_project_details") {
    const snapshot = { ...s.form };
    await s.handleSave();
    try {
      const sb = getSupabase();
      let pid = snapshot.project_id;
      if (!pid && snapshot.slug) {
        const { data: projectOpts } = await loadProjectOptions(sb);
        pid = (projectOpts || []).find((p) => p.slug === snapshot.slug)?.id;
      }
      if (!pid) return;

      const patch = {};
      if ("github_url" in snapshot) patch.github = snapshot.github_url || "";
      if ("demo_url" in snapshot) patch.demo = snapshot.demo_url || "";
      if (snapshot.description) patch.description = snapshot.description;
      else if (snapshot.full_description) patch.description = snapshot.full_description;
      if ("show_github" in snapshot) patch.show_github = snapshot.show_github !== false;

      if (Object.keys(patch).length > 0) {
        const { error } = await sb.from("portfolio_projects").update(patch).eq("id", pid);
        if (error) throw error;
      }
      s.setNotice?.("Saved details + project card synced.");
    } catch (e) {
      s.setNotice?.(`Saved details. Project card sync failed: ${e.message}`);
    }
    return;
  }

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
    const summary = snapshot.description || "";
    const card = {
      title: snapshot.title || "",
      slug: snapshot.slug || "",
      description: summary,
      thumbnail_url: snapshot.image || "",
      github_url: snapshot.github || "",
      demo_url: snapshot.demo || "",
      show_github: snapshot.show_github !== false,
      show_demo: Boolean(snapshot.demo),
    };
    if (Array.isArray(snapshot.tags)) card.tags = snapshot.tags;
    if (!match) {
      if (!card.slug) {
        s.setNotice?.("Saved project. Add a slug, save again, and its Details row will be created.");
        return;
      }
      const c = await saveDetail(sb, null, { ...card, full_description: summary, project_id: pid });
      if (c.error) throw c.error;
      s.setNotice?.("Saved project + Details row created.");
      return;
    }
    const r = await saveDetail(sb, match.id, {
      ...match,
      title: snapshot.title || "",
      slug: snapshot.slug || "",
      description: summary,
      full_description: match.full_description || summary,
      github_url: snapshot.github || "",
      demo_url: snapshot.demo || "",
      thumbnail_url: snapshot.image || "",
      show_github: snapshot.show_github !== false,
      show_demo: snapshot.demo ? true : match.show_demo,
      tags: snapshot.tags,
    });
    if (r.error) throw r.error;
    s.setNotice?.("Saved project + details synced.");
  } catch (e) {
    s.setNotice?.(`Saved project. Details sync failed: ${e.message}`);
  }
}

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
    if (!did) {
      if (!p.slug) continue;
      const { error } = await saveDetail(sb, null, {
        project_id: p.id,
        title: p.title || "",
        slug: p.slug || "",
        description: p.description || "",
        full_description: p.description || "",
        github_url: p.github || "",
        demo_url: p.demo || "",
        thumbnail_url: p.image || "",
        show_github: p.show_github !== false,
        show_demo: Boolean(p.demo),
        tags: p.tags || [],
      });
      if (error) {
        s.setNotice?.(`Sync failed: ${error.message}`);
        return;
      }
      n++;
      continue;
    }
    const m = rowById.get(did);
    const { error } = await saveDetail(sb, did, {
      ...m,
      title: p.title || "",
      slug: p.slug || "",
      description: p.description || "",
      full_description: m.full_description || p.description || "",
      github_url: p.github || "",
      demo_url: p.demo || "",
      thumbnail_url: p.image || "",
      show_github: p.show_github !== false,
      show_demo: p.demo ? true : m.show_demo,
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
