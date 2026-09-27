import { fromLines } from "./text";

export const navToText = (arr) =>
  Array.isArray(arr)
    ? arr.map((n) => (typeof n === "string" ? n : `${n?.title || ""} | ${n?.path || ""}`.trim())).join("\n")
    : "";

export const textToNav = (text) =>
  fromLines(text).map((line) => {
    const [title, ...rest] = line.split("|");
    return { title: (title || "").trim(), path: rest.join("|").trim() || "#" };
  });

export const highlightsToText = (arr) =>
  Array.isArray(arr)
    ? arr.map((h) => (typeof h === "string" ? h : `${h?.value || ""} | ${h?.label || ""}`.trim())).join("\n")
    : "";

export const textToHighlights = (text) =>
  fromLines(text).map((line) => {
    const [value, ...rest] = line.split("|");
    return { value: (value || "").trim(), label: rest.join("|").trim() };
  });

export const paragraphsToText = (arr) => (Array.isArray(arr) ? arr.join("\n\n") : "");

export const textToParagraphs = (text) =>
  String(text ?? "")
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

export const journeyToText = (items) => {
  if (!Array.isArray(items)) return "";
  return items
    .map((b) => {
      const subs = Array.isArray(b?.items) ? b.items.map((s) => `- ${s?.title || ""} | ${s?.desc || ""}`.trim()).join("\n") : "";
      return `${b?.label || ""}\n${subs}`.trim();
    })
    .join("\n\n");
};

export const textToJourney = (text) =>
  String(text ?? "")
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((s) => s.trim()).filter(Boolean);
      if (!lines.length) return null;
      let label = "";
      let start = 0;
      if (!lines[0].startsWith("-")) {
        label = lines[0];
        start = 1;
      }
      const items = lines
        .slice(start)
        .map((line) => {
          const clean = line.replace(/^-\s*/, "");
          const [title, ...rest] = clean.split("|");
          return { title: (title || "").trim(), desc: rest.join("|").trim() };
        })
        .filter((x) => x.title || x.desc);
      return { label, items };
    })
    .filter(Boolean);
