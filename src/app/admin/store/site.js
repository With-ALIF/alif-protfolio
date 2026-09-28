import { saveAwardsSection } from "./awards";

const ZERO = "00000000-0000-0000-0000-000000000000";
const wipe = (sb, table) => sb.from(table).delete().neq("id", ZERO);
const S = (v) => v || "";

export async function loadSiteRows(sb) {
  const [prof, soc, nav, hero, hl, paras, awards] = await Promise.all([
    sb.from("portfolio_profiles").select("*").limit(1),
    sb.from("portfolio_socials").select("*"),
    sb.from("portfolio_nav_items").select("*").order("sort_order"),
    sb.from("portfolio_hero").select("*").limit(1),
    sb.from("portfolio_hero_highlights").select("*").order("sort_order"),
    sb.from("portfolio_about_paragraphs").select("*").order("sort_order"),
    sb.from("portfolio_awards").select("*").order("sort_order"),
  ]);
  const bad = [prof, soc, nav, hero, hl, paras, awards].find((r) => r.error);
  if (bad) return { data: null, error: bad.error };
  const p = prof.data?.[0] || {};
  const socials = {};
  for (const s of soc.data || []) if (s.platform) socials[s.platform] = s.url || "";
  const h = hero.data?.[0] || {};
  const row = (section, data) => ({ id: section, section, data, is_published: true, version: 1 });
  return {
    data: [
      row("about", { paragraphs: (paras.data || []).map((x) => x.body || "") }),
      row("awards", { items: (awards.data || []).map((a) => ({ id: a.id, title: S(a.title), issuer: S(a.issuer), image: S(a.image), description: S(a.description), date: S(a.date), sortOrder: a.sort_order ?? 0, isPublished: a.is_published !== false })) }),
      row("hero", { headline: S(h.headline), value: S(h.value), highlights: (hl.data || []).map((x) => ({ value: S(x.value), label: S(x.label) })) }),
      row("site", {
        profile: { name: S(p.name), handle: S(p.handle), role: S(p.role), headline: S(p.headline), value: S(p.value), email: S(p.email), location: S(p.location), resumeUrl: S(p.resume_url), profileImage: S(p.profile_image), socials },
        nav: (nav.data || []).map((n) => ({ path: n.path || "#", title: n.title || "" })),
      }),
    ],
    error: null,
  };
}

async function singletonId(sb, table) {
  const { data, error } = await sb.from(table).select("id").limit(1);
  if (error) return { id: null, error };
  if (data?.[0]?.id) return { id: data[0].id, error: null };
  const ins = await sb.from(table).insert({}).select("id").single();
  return { id: ins.data?.id || null, error: ins.error };
}

async function saveSite(sb, data) {
  const prof = data?.profile || {};
  const { id: pid, error: e0 } = await singletonId(sb, "portfolio_profiles");
  if (e0 || !pid) return { error: e0 || new Error("No profile row") };
  const up = await sb.from("portfolio_profiles").update({ name: S(prof.name), handle: S(prof.handle), role: S(prof.role), headline: S(prof.headline), value: S(prof.value), email: S(prof.email), location: S(prof.location), resume_url: S(prof.resumeUrl), profile_image: S(prof.profileImage) }).eq("id", pid);
  if (up.error) return up;
  const del = await sb.from("portfolio_socials").delete().eq("profile_id", pid);
  if (del.error) return del;
  const rows = Object.entries(prof.socials || {}).filter(([, v]) => String(v || "").trim()).map(([platform, url]) => ({ profile_id: pid, platform, url }));
  if (rows.length > 0) {
    const ins = await sb.from("portfolio_socials").insert(rows);
    if (ins.error) return ins;
  }
  const w = await wipe(sb, "portfolio_nav_items");
  if (w.error) return w;
  const nav = (data?.nav || []).map((n, i) => ({ title: n.title || "", path: n.path || "#", sort_order: i }));
  if (nav.length > 0) return sb.from("portfolio_nav_items").insert(nav);
  return { error: null };
}

async function saveHero(sb, data) {
  const { id: hid, error: e0 } = await singletonId(sb, "portfolio_hero");
  if (e0 || !hid) return { error: e0 || new Error("No hero row") };
  const up = await sb.from("portfolio_hero").update({ headline: S(data?.headline), value: S(data?.value) }).eq("id", hid);
  if (up.error) return up;
  const del = await sb.from("portfolio_hero_highlights").delete().eq("hero_id", hid);
  if (del.error) return del;
  const rows = (data?.highlights || []).map((x, i) => ({ hero_id: hid, value: S(x.value), label: S(x.label), sort_order: i }));
  if (rows.length > 0) {
    const ins = await sb.from("portfolio_hero_highlights").insert(rows);
    if (ins.error) return ins;
  }
  return { error: null };
}

async function saveAbout(sb, data) {
  const w = await wipe(sb, "portfolio_about_paragraphs");
  if (w.error) return w;
  const rows = (data?.paragraphs || []).map((body, i) => ({ body: String(body || ""), sort_order: i }));
  if (rows.length > 0) {
    const ins = await sb.from("portfolio_about_paragraphs").insert(rows);
    if (ins.error) return ins;
  }
  return { error: null };
}

export async function saveSiteSection(sb, section, data) {
  if (section === "site") return saveSite(sb, data);
  if (section === "hero") return saveHero(sb, data);
  if (section === "about") return saveAbout(sb, data);
  if (section === "awards") return saveAwardsSection(sb, data);
  return { error: null };
}
