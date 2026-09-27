import { SITE_SECTIONS } from "../tables";
import { fromLines, textToGallery, textToStats, textToTech, textToTimeline } from "./text";

export const buildPayload = (table, form) => {
  const payload = {};
  for (const f of table.fields) {
    const raw = form[f.key];
    if (f.type === "bool") payload[f.key] = !!raw;
    else if (f.type === "number") payload[f.key] = raw === "" ? 0 : Number(raw);
    else if (f.type === "lines") payload[f.key] = fromLines(raw);
    else if (f.type === "techlines") payload[f.key] = textToTech(raw);
    else if (f.type === "techselect")
      payload[f.key] = Array.isArray(raw) ? raw.map((t) => ({ name: t?.name || "", icon: t?.icon || "" })) : [];
    else if (f.type === "gallerylines") payload[f.key] = textToGallery(raw);
    else if (f.type === "galleryedit")
      payload[f.key] = Array.isArray(raw) ? raw.map((g) => ({ title: g?.title || "", image: g?.image || "" })) : [];
    else if (f.type === "timelinelines") payload[f.key] = textToTimeline(raw);
    else if (f.type === "timelineedit")
      payload[f.key] = Array.isArray(raw) ? raw.map((t) => ({ date: t?.date || "", title: t?.title || "", detail: t?.detail || "" })) : [];
    else if (f.type === "listedit")
      payload[f.key] = Array.isArray(raw) ? raw.map((s) => String(s ?? "").trim()).filter(Boolean) : [];
    else if (f.type === "kvlines") payload[f.key] = textToStats(raw);
    else if (f.type === "statsedit") {
      payload[f.key] = {};
      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        for (const [k, v] of Object.entries(raw)) {
          if (String(k).trim()) payload[f.key][String(k).trim()] = v;
        }
      }
    }
    else if (f.type === "dbinfo")
      payload[f.key] = { name: raw?.name || "", icon: raw?.icon || "", description: raw?.description || "" };
    else if (f.type === "sitecontent") payload[f.key] = raw && typeof raw === "object" ? raw : {};
    else if (f.type === "sitesection") payload[f.key] = raw || SITE_SECTIONS[0];
    else payload[f.key] = raw ?? "";
  }
  return payload;
};
