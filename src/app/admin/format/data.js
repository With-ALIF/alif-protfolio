import { SITE_SECTIONS } from "../tables";
import { galleryToText, statsToText, techToText, timelineToText } from "./text";

export const blankSiteData = (section) => {
  if (section === "site")
    return {
      profile: { name: "", handle: "", role: "", headline: "", value: "", email: "", location: "", resumeUrl: "", profileImage: "", socials: { github: "", linkedin: "", facebook: "", telegram: "", whatsapp: "", instagram: "" } },
      nav: [],
    };
  if (section === "hero") return { headline: "", value: "", highlights: [] };
  if (section === "about") return { paragraphs: [] };
  if (section === "awards") return { items: [] };
  return {};
};

export const normalizeSiteData = (section, raw) => {
  const data = raw && typeof raw === "object" ? raw : {};
  const base = blankSiteData(section);
  if (section === "site")
    return {
      profile: { ...base.profile, ...(data.profile || {}), socials: { ...base.profile.socials, ...(data.profile?.socials || {}) } },
      nav: Array.isArray(data.nav) ? data.nav : [],
    };
  if (section === "hero")
    return { headline: data.headline || "", value: data.value || "", highlights: Array.isArray(data.highlights) ? data.highlights : [] };
  if (section === "about") return { paragraphs: Array.isArray(data.paragraphs) ? data.paragraphs : [] };
  if (section === "awards") return { items: Array.isArray(data.items) ? data.items : [] };
  return data;
};

export const pretty = (field, value) => {
  if (field.type === "bool") return !!value;
  if (field.type === "tagref") return value || null;
  if (field.type === "tagselect") return Array.isArray(value) ? value : [];
  if (value === null || value === undefined)
    return field.type === "dbinfo" ? { name: "", icon: "", description: "" } : field.type === "sitecontent" ? {} : "";
  if (field.type === "lines") return Array.isArray(value) ? value.join("\n") : typeof value === "string" ? value : "";
  if (field.type === "techlines") return techToText(value);
  if (field.type === "techselect") return Array.isArray(value) ? value : [];
  // Without this the generic object fallback below stringifies the array, and
  // the editor then reads it as "not an array" and shows nothing.
  if (field.type === "techstack") return Array.isArray(value) ? value : [];
  if (field.type === "gallerylines") return galleryToText(value);
  if (field.type === "galleryedit") return Array.isArray(value) ? value : [];
  if (field.type === "timelinelines") return timelineToText(value);
  if (field.type === "timelineedit") return Array.isArray(value) ? value : [];
  if (field.type === "listedit") return Array.isArray(value) ? value : [];
  if (field.type === "kvlines") return statsToText(value);
  if (field.type === "statsedit") return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  if (field.type === "dbinfo")
    return typeof value === "object" && !Array.isArray(value)
      ? { name: value.name || "", icon: value.icon || "", description: value.description || "", tag_id: value.tag_id || null }
      : { name: "", icon: "", description: "", tag_id: null };
  if (field.type === "sitecontent") return value && typeof value === "object" ? value : {};
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
};

export const blankFor = (table) => {
  const obj = {};
  for (const f of table.fields) {
    if (f.type === "bool") obj[f.key] = f.key === "is_published" || f.key.startsWith("show_");
    else if (f.type === "tagselect") obj[f.key] = [];
    else if (f.type === "number") obj[f.key] = 0;
    else if (f.type === "select") obj[f.key] = f.options?.[0] ?? "";
    else if (f.key === "section") obj[f.key] = SITE_SECTIONS[0];
    else if (f.type === "dbinfo") obj[f.key] = { name: "", icon: "", description: "" };
    else if (f.type === "sitecontent") obj[f.key] = blankSiteData(SITE_SECTIONS[0]);
    else if (f.type === "tagref") obj[f.key] = null;
    else if (["listedit", "galleryedit", "timelineedit", "techstack"].includes(f.type)) obj[f.key] = [];
    else obj[f.key] = "";
  }
  return obj;
};
