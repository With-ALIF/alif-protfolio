// Server-side CMS bundle: Supabase first, local data files as fallback.
// All returned values are plain JSON (safe as client-component props).
import { createClient } from "@supabase/supabase-js";
import { projects as localProjects, caseStudies as localStudies } from "@/data/projects";
import { siteProfile as localProfile, navItems as localNav } from "@/data/site";
import { heroFallback } from "@/data/hero";
import { aboutParagraphs } from "@/data/about";
import { journeyMilestones } from "@/data/journey";
import { awards as localAwards } from "@/data/awards";
import { education as localEducation } from "@/data/education";
import { experienceData as localExperience } from "@/data/experience";
import { servicesData as localServices } from "@/data/services";
import { skillGroups as localSkillGroups, toolsList as localTools } from "@/data/skills";

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

async function fetchSection(name) {
  try {
    const sb = serverClient();
    if (!sb) return null;
    const { data, error } = await sb
      .from("alif_site_content")
      .select("data")
      .eq("section", name)
      .eq("is_published", true)
      .maybeSingle();
    if (error || !data?.data) return null;
    return data.data;
  } catch {
    return null;
  }
}

const bySort = (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0);

function mapProject(row) {
  return {
    id: row.slug,
    uuid: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? "",
    image: row.image ?? "",
    github: row.github ?? "",
    demo: row.demo ?? "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    featured: !!row.featured,
    sortOrder: row.sort_order ?? 0,
    isPublished: row.is_published !== false,
    showGithub: row.show_github !== false,
  };
}

export async function getCmsBundle() {
  let [
    siteSection,
    heroSection,
    aboutSection,
    journeySection,
    awardsSection,
    projectRows,
    detailRows,
    skillRows,
    toolRows,
    tagRows,
    educationRows,
    experienceRows,
    serviceRows,
    journeyRows,
  ] = await Promise.all([
    fetchSection("site"),
    fetchSection("hero"),
    fetchSection("about"),
    fetchSection("journey"),
    fetchSection("awards"),
    fetchTable("alif_projects"),
    fetchTable("alif_project_details", "slug"),
    fetchTable("alif_skills"),
    fetchTable("alif_tools"),
    fetchTable("alif_tag"),
    fetchTable("alif_education"),
    fetchTable("alif_experience"),
    fetchTable("alif_services"),
    fetchTable("alif_journey"),
  ]);

  // --- site / hero / about ---
  // Old seeds lack the "group" column → ignore them and use local groups.
  if (skillRows && !skillRows.some((r) => r.group)) skillRows = null;
  const site = {
    profile: siteSection?.profile ?? localProfile,
    nav: Array.isArray(siteSection?.nav) && siteSection.nav.length > 0 ? siteSection.nav : localNav,
  };
  const hero = {
    headline: heroSection?.headline ?? heroFallback.headline,
    value: heroSection?.value ?? heroFallback.value,
    highlights:
      Array.isArray(heroSection?.highlights) && heroSection.highlights.length > 0
        ? heroSection.highlights
        : heroFallback.highlights,
  };
  const about = {
    paragraphs:
      Array.isArray(aboutSection?.paragraphs) && aboutSection.paragraphs.length > 0
        ? aboutSection.paragraphs
        : aboutParagraphs,
  };

  // --- journey / awards ---
  // Priority: alif_journey table → site_content section → local fallback.
  const journey = {
    items: (() => {
      if (journeyRows) {
        const grouped = new Map();
        for (const r of journeyRows) {
          const label = r.label || "";
          if (!grouped.has(label)) grouped.set(label, []);
          grouped.get(label).push({ title: r.title, desc: r.description ?? "" });
        }
        const items = [...grouped.entries()].map(([label, items]) => ({ label, items }));
        if (items.length > 0) return items;
      }
      if (Array.isArray(journeySection?.items) && journeySection.items.length > 0) return journeySection.items;
      return journeyMilestones;
    })(),
  };
  const awardsList = (() => {
    const items = Array.isArray(awardsSection?.items) ? awardsSection.items : localAwards;
    return items.filter((a) => a.isPublished !== false).sort(bySort);
  })();

  // --- projects + details ---
  const projects = (projectRows ? projectRows.map(mapProject) : localProjects)
    .filter((p) => p.isPublished !== false)
    .sort(bySort);
  const studies = {};
  if (detailRows) {
    // Primary link: project_id → project slug. Fallback: row slug.
    const slugById = {};
    for (const r of projectRows || []) slugById[r.id] = r.slug;
    for (const row of detailRows) {
      const key = (row.project_id && slugById[row.project_id]) || row.slug;
      if (key) studies[key] = row;
    }
  } else {
    for (const s of localStudies) studies[s.id] = s;
  }

  // --- skills / tools / tags ---
  let skillGroups = localSkillGroups.map((g) => ({ ...g, skills: [...g.skills] }));
  if (skillRows) {
    const order = ["Languages", "Frameworks", "Backend Services"];
    const grouped = new Map();
    for (const row of skillRows) {
      const g = row.group || "Other";
      if (!grouped.has(g)) grouped.set(g, []);
      grouped.get(g).push(row.name);
    }
    skillGroups = [
      ...order.filter((g) => grouped.has(g)).map((g) => ({ title: g, skills: grouped.get(g) })),
      ...[...grouped.keys()].filter((g) => !order.includes(g)).map((g) => ({ title: g, skills: grouped.get(g) })),
    ];
  }
  const tools = toolRows ? toolRows.map((r) => r.name) : [...localTools];
  if (!skillGroups.some((g) => g.title === "Tools") && tools.length > 0) {
    skillGroups = [...skillGroups, { title: "Tools", skills: tools }];
  }
  const tagIcons = {};
  if (tagRows) {
    for (const row of tagRows) {
      if (row.name) tagIcons[String(row.name).toLowerCase().replace(/[^a-z0-9]/g, "")] = row.icon || "";
    }
  }

  // --- education / experience / services ---
  const education = (educationRows
    ? educationRows.map((r) => ({
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
    : localEducation
  ).sort(bySort);

  const experience = (experienceRows
    ? experienceRows.map((r) => ({
        id: r.id,
        title: r.company ?? "",
        role: r.role ?? "",
        year: r.duration ?? "",
        status: r.status ?? "Active",
        logo: r.logo ?? "",
        sortOrder: r.sort_order ?? 0,
      }))
    : localExperience
  ).sort(bySort);

  const services = (serviceRows
    ? serviceRows.map((r) => ({
        id: r.id,
        title: r.title,
        icon: r.icon || "code",
        desc: r.description ?? "",
        sortOrder: r.sort_order ?? 0,
      }))
    : localServices
  ).sort(bySort);

  return {
    site,
    hero,
    about,
    journey,
    awards: awardsList,
    projects,
    studies,
    skillGroups,
    tagIcons,
    education,
    experience,
    services,
  };
}

export async function getSiteSection() {
  const bundle = await getCmsBundle();
  return bundle.site;
}
