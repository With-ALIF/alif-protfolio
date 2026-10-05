// Server-side CMS bundle. Supabase is the single source of truth for all
// portfolio content — there are no local data-file fallbacks. Every shape is
// guaranteed to be safe to render (arrays stay arrays, `profile.socials`
// stays an object) so a database outage degrades to empty sections instead
// of throwing.
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function serverClient() {
  if (!URL || !ANON_KEY) return null;
  return createClient(URL, ANON_KEY, {
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, next: { revalidate: 60 } }),
    },
  });
}

async function fetchTable(name, orderBy = "sort_order") {
  try {
    const sb = serverClient();
    if (!sb) return null;
    const { data, error } = await sb
      .from(name)
      .select("*")
      .order(orderBy, { ascending: true });
    if (error || !data || data.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

const bySort = (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0);

// Match key for technology/tag names. Case- and whitespace-insensitive but
// punctuation-preserving, so "Java Script" matches "JavaScript" while "C" and
// "C++" stay distinct.
const tagKey = (name) => String(name || "").toLowerCase().replace(/\s+/g, "");

// Groups a project's technologies under the global category list, in the
// admin-defined category order. Rules the public page relies on: a nameless
// technology is dropped, and a category left with no technologies is dropped
// too. Technologies that belong to no category are NOT rendered here — the
// public page only shows filed categories. The admin still lists them (see
// loadDetails) so they can be put in a category instead of vanishing.
function groupTechnologies(categoryRows, techRows, resolveIcon) {
  const groups = [];
  const index = new Map();
  // Trim before the emptiness check: " " is truthy in JS and would otherwise
  // keep a nameless chip (and its category) alive on the public page.
  const toTech = (t) => ({ name: String(t.name ?? "").trim(), icon: resolveIcon(t) });

  for (const row of categoryRows || []) {
    const techs = (techRows || []).filter((t) => t.category_id === row.id).map(toTech).filter((t) => t.name);
    const entry = { id: row.id, name: String(row.name ?? "").trim(), technologies: techs };
    index.set(row.id, entry);
    groups.push(entry);
  }

  return groups.filter((g) => g.technologies.length > 0);
}

function mapProject(row, tags = []) {
  return {
    id: row.slug,
    uuid: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? "",
    image: row.image ?? "",
    github: row.github ?? "",
    demo: row.demo ?? "",
    tags: Array.isArray(tags) ? tags : [],
    featured: !!row.featured,
    sortOrder: row.sort_order ?? 0,
    isPublished: row.is_published !== false,
    showGithub: row.show_github !== false,
  };
}

export async function getCmsBundle() {
  let [
    profileRows,
    socialRows,
    navRows,
    heroRows,
    highlightRows,
    paraRows,
    journeyRows,
    awardRows,
    projectRows,
    projectTagRows,
    tagRows,
    detailRows,
    techRows,
    featRows,
    galRows,
    timeRows,
    chalRows,
    soluRows,
    statRows,
    dbRows,
    skillRows,
    toolRows,
    educationRows,
    experienceRows,
    serviceRows,
    techCategoryRows,
  ] = await Promise.all([
    fetchTable("portfolio_profiles", "created_at"),
    fetchTable("portfolio_socials", "created_at"),
    fetchTable("portfolio_nav_items"),
    fetchTable("portfolio_hero", "created_at"),
    fetchTable("portfolio_hero_highlights"),
    fetchTable("portfolio_about_paragraphs"),
    fetchTable("portfolio_journey"),
    fetchTable("portfolio_awards"),
    fetchTable("portfolio_projects"),
    fetchTable("portfolio_project_tags", "created_at"),
    fetchTable("portfolio_tags"),
    fetchTable("portfolio_project_details", "created_at"),
    fetchTable("portfolio_detail_technologies"),
    fetchTable("portfolio_detail_features"),
    fetchTable("portfolio_detail_gallery"),
    fetchTable("portfolio_detail_timeline"),
    fetchTable("portfolio_detail_challenges"),
    fetchTable("portfolio_detail_solutions"),
    fetchTable("portfolio_detail_statistics"),
    fetchTable("portfolio_detail_database", "created_at"),
    fetchTable("portfolio_skills"),
    fetchTable("portfolio_tools"),
    fetchTable("portfolio_education"),
    fetchTable("portfolio_experience"),
    fetchTable("portfolio_services"),
    fetchTable("portfolio_tech_categories"),
  ]);

  // --- site / hero / about ---
  const profRow = profileRows?.[0];
  const socials = {};
  for (const s of socialRows || []) {
    if (s.platform) socials[s.platform] = s.url || "";
  }
  const site = {
    profile: profRow
      ? {
          name: profRow.name ?? "",
          handle: profRow.handle ?? "",
          role: profRow.role ?? "",
          headline: profRow.headline ?? "",
          value: profRow.value ?? "",
          email: profRow.email ?? "",
          location: profRow.location ?? "",
          resumeUrl: profRow.resume_url ?? "",
          profileImage: profRow.profile_image ?? "",
          socials,
        }
      : { socials: {} },
    nav: Array.isArray(navRows)
      ? navRows.map((r) => ({ path: r.path || "#", title: r.title || "" }))
      : [],
  };
  const heroRow = heroRows?.[0];
  const hero = {
    headline: heroRow?.headline ?? "",
    value: heroRow?.value ?? "",
    highlights: Array.isArray(highlightRows)
      ? highlightRows.map((r) => ({ value: r.value ?? "", label: r.label ?? "" }))
      : [],
  };
  const about = {
    paragraphs: Array.isArray(paraRows) ? paraRows.map((r) => r.body ?? "") : [],
  };

  // --- journey / awards ---
  const journey = {
    items: (() => {
      if (!journeyRows) return [];
      const grouped = new Map();
      for (const r of journeyRows) {
        const label = r.label || "";
        if (!grouped.has(label)) grouped.set(label, []);
        grouped.get(label).push({ title: r.title, desc: r.description ?? "" });
      }
      return [...grouped.entries()].map(([label, items]) => ({ label, items }));
    })(),
  };
  const awardsList = (awardRows || [])
    .map((r) => ({
      id: r.id,
      title: r.title,
      issuer: r.issuer ?? "",
      image: r.image ?? "",
      description: r.description ?? "",
      date: r.date ?? "",
      sortOrder: r.sort_order ?? 0,
      isPublished: r.is_published !== false,
    }))
    .filter((a) => a.isPublished !== false)
    .sort(bySort);

  // --- projects + details ---
  // Tags resolve via portfolio_project_tags → portfolio_tags (ordered by tag sort_order).
  const tagById = {};
  const tagByName = new Map();
  for (const t of tagRows || []) {
    if (!t.name) continue;
    tagById[t.id] = t;
    if (!tagByName.has(tagKey(t.name))) tagByName.set(tagKey(t.name), t);
  }
  const tagsByProject = {};
  for (const link of projectTagRows || []) {
    const t = tagById[link.tag_id];
    if (!t) continue;
    if (!tagsByProject[link.project_id]) tagsByProject[link.project_id] = [];
    tagsByProject[link.project_id].push({ name: t.name, order: t.sort_order ?? 0 });
  }
  for (const pid of Object.keys(tagsByProject)) {
    tagsByProject[pid].sort((a, b) => a.order - b.order);
  }
  const projectTags = (pid) => (tagsByProject[pid] || []).map((t) => t.name);

  const projects = (projectRows || [])
    .map((r) => mapProject(r, projectTags(r.id)))
    .filter((p) => p.isPublished !== false)
    .sort(bySort);

  // Group detail child rows by detail_id.
  const groupChildren = (rows) => {
    const m = {};
    for (const r of rows || []) {
      if (!m[r.detail_id]) m[r.detail_id] = [];
      m[r.detail_id].push(r);
    }
    return m;
  };
  const techByDetail = groupChildren(techRows);
  const featByDetail = groupChildren(featRows);
  const galByDetail = groupChildren(galRows);
  const timeByDetail = groupChildren(timeRows);
  const chalByDetail = groupChildren(chalRows);
  const soluByDetail = groupChildren(soluRows);
  const statByDetail = groupChildren(statRows);
  const dbByDetail = {};
  for (const r of dbRows || []) dbByDetail[r.detail_id] = r;

  const slugByProjectId = {};
  for (const r of projectRows || []) slugByProjectId[r.id] = r.slug;
  const techCategoryName = {};
  for (const c of techCategoryRows || []) techCategoryName[c.id] = String(c.name ?? "");
  const studies = {};
  for (const row of detailRows || []) {
    // Primary link: project_id → project slug. Fallback: row slug.
    const key = (row.project_id && slugByProjectId[row.project_id]) || row.slug;
    if (!key) continue;
    const stats = {};
    for (const s of statByDetail[row.id] || []) {
      if (s.label) stats[s.label] = s.value ?? "";
    }
    const db = dbByDetail[row.id];
    studies[key] = {
      id: row.id,
      project_id: row.project_id,
      slug: key,
      title: row.title ?? "",
      description: row.description ?? "",
      full_description: row.full_description ?? "",
      github_url: row.github_url ?? "",
      demo_url: row.demo_url ?? "",
      thumbnail_url: row.thumbnail_url ?? "",
      status: row.status ?? "Planned",
      featured: !!row.featured,
      tags: projectTags(row.project_id),
      // Icon URL resolves live from the tag row via tag_id (UUID link);
      // the stored copy is only a fallback.
      technologies: (techByDetail[row.id] || []).map((t) => ({
        name: t.name ?? "",
        icon: (t.tag_id && tagById[t.tag_id]?.icon) || t.icon || "",
        // Carried through so the project card can filter chips by category.
        categoryId: t.category_id ?? null,
        categoryName: techCategoryName[t.category_id] ?? "",
      })),
      // Same technologies, grouped by admin-defined category for the details page.
      techCategories: groupTechnologies(
        techCategoryRows || [],
        techByDetail[row.id] || [],
        (t) => (t.tag_id && tagById[t.tag_id]?.icon) || t.icon || "",
      ),
      features: (featByDetail[row.id] || []).map((t) => t.body ?? ""),
      gallery: (galByDetail[row.id] || []).map((t) => ({ title: t.title ?? "", image: t.image_url ?? "" })),
      timeline: (timeByDetail[row.id] || []).map((t) => ({ date: t.date ?? "", title: t.title ?? "", detail: t.detail ?? "" })),
      challenges: (chalByDetail[row.id] || []).map((t) => t.body ?? ""),
      solutions: (soluByDetail[row.id] || []).map((t) => t.body ?? ""),
      statistics: stats,
      database_info: db
        ? {
            name: db.name ?? "",
            icon: (db.tag_id && tagById[db.tag_id]?.icon) || db.icon || "",
            description: db.description ?? "",
          }
        : {},
      show_database: !!row.show_database,
      show_github: row.show_github !== false,
      show_demo: row.show_demo !== false,
    };
  }

  // --- skills / tools ---
  // Icons resolve per row through the tag_id foreign key, so two rows that
  // merely look alike ("C" vs "C++") can never overwrite each other the way
  // they did when icons were collected into one name-keyed lookup object.
  // The tag_id is only trusted when the linked tag actually carries the same
  // name; otherwise fall back to a punctuation-preserving name match, and
  // finally to the row's own icon column.
  const resolveIcon = (row) => {
    const linked = row.tag_id ? tagById[row.tag_id] : null;
    if (linked?.icon && tagKey(linked.name) === tagKey(row.name)) return linked.icon;
    const byName = tagByName.get(tagKey(row.name));
    if (byName?.icon) return byName.icon;
    return row.icon || "";
  };

  // Rows without a `group` land in "Other" rather than being discarded.
  let skillGroups = [];
  if (skillRows) {
    const order = ["Languages", "Frameworks", "Backend Services"];
    const grouped = new Map();
    for (const row of skillRows) {
      const g = row.group || "Other";
      if (!grouped.has(g)) grouped.set(g, []);
      grouped.get(g).push({ name: row.name, icon: resolveIcon(row) });
    }
    skillGroups = [
      ...order.filter((g) => grouped.has(g)).map((g) => ({ title: g, skills: grouped.get(g) })),
      ...[...grouped.keys()].filter((g) => !order.includes(g)).map((g) => ({ title: g, skills: grouped.get(g) })),
    ];
  }
  const tools = (toolRows || []).map((r) => ({ name: r.name, icon: resolveIcon(r) }));
  if (!skillGroups.some((g) => g.title === "Tools") && tools.length > 0) {
    skillGroups = [...skillGroups, { title: "Tools", skills: tools }];
  }

  // --- education / experience / services ---
  const education = (educationRows || [])
    .map((r) => ({
      id: r.id,
      degree: r.degree,
      institute: r.institute ?? "",
      district: r.district ?? "",
      class: r.class ?? "",
      year: r.year ?? "",
      description: r.description ?? "",
      logo: r.logo ?? "",
      sortOrder: r.sort_order ?? 0,
    }))
    .sort(bySort);

  const experience = (experienceRows || [])
    .map((r) => ({
      id: r.id,
      title: r.company ?? "",
      role: r.role ?? "",
      year: r.duration ?? "",
      status: r.status ?? "Active",
      logo: r.logo ?? "",
      sortOrder: r.sort_order ?? 0,
    }))
    .sort(bySort);

  const services = (serviceRows || [])
    .map((r) => ({
      id: r.id,
      title: r.title,
      icon: r.icon || "code",
      desc: r.description ?? "",
      sortOrder: r.sort_order ?? 0,
    }))
    .sort(bySort);

  return {
    site,
    hero,
    about,
    journey,
    awards: awardsList,
    projects,
    studies,
    skillGroups,
    education,
    experience,
    services,
  };
}

export async function getSiteSection() {
  const bundle = await getCmsBundle();
  return bundle.site;
}