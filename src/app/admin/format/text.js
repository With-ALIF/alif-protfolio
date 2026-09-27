export const fromLines = (text) =>
  String(text ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export const techToText = (arr) =>
  Array.isArray(arr)
    ? arr.map((t) => (typeof t === "string" ? t : `${t?.name || ""} | ${t?.icon || ""}`.trim())).join("\n")
    : "";

export const textToTech = (text) =>
  fromLines(text).map((line) => {
    const [name, ...rest] = line.split("|");
    return { name: (name || "").trim(), icon: rest.join("|").trim() };
  });

export const galleryToText = (arr) =>
  Array.isArray(arr)
    ? arr.map((g) => (typeof g === "string" ? g : `${g?.title || ""} | ${g?.image || ""}`.trim())).join("\n")
    : "";

export const textToGallery = (text) =>
  fromLines(text).map((line) => {
    const [title, ...rest] = line.split("|");
    return { title: (title || "").trim(), image: rest.join("|").trim() };
  });

export const timelineToText = (arr) =>
  Array.isArray(arr)
    ? arr.map((t) => (typeof t === "string" ? t : `${t?.date || ""} | ${t?.title || ""} | ${t?.detail || ""}`.trim())).join("\n")
    : "";

export const textToTimeline = (text) =>
  fromLines(text).map((line) => {
    const [date, title, ...rest] = line.split("|");
    return { date: (date || "").trim(), title: (title || "").trim(), detail: rest.join("|").trim() };
  });

export const statsToText = (obj) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return "";
  return Object.entries(obj)
    .map(([k, v]) => `${k} : ${v}`)
    .join("\n");
};

export const textToStats = (text) => {
  const out = {};
  for (const line of fromLines(text)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim();
    if (k) out[k] = v;
  }
  return out;
};
