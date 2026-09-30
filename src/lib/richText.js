import { createElement } from "react";

// Inline rich text for admin-entered content.
//   **word**    → bold
//   {{word}}    → bold
//   **{{word}}** → bold
// Everything else renders as plain (escaped) text — no HTML injection.
const TOKEN = /(\*\*.+?\*\*|\{\{.+?\}\})/g;

function toNode(part, key) {
  const m1 = /^\*\*([\s\S]+)\*\*$/.exec(part);
  const inner = m1 ? m1[1] : part;
  const m2 = /^\{\{([\s\S]+)\}\}$/.exec(inner);
  const text = m2 ? m2[1] : inner;
  if (m1 || m2) return createElement("strong", { key }, text);
  return part;
}

export function renderRich(text) {
  const s = String(text ?? "");
  if (!TOKEN.test(s)) return s;
  TOKEN.lastIndex = 0;
  return s.split(TOKEN).map((part, i) => toNode(part, i));
}
