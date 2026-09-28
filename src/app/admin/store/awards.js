// Awards section items <-> portfolio_awards rows (diff by id).
export async function saveAwardsSection(sb, data) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const ex = await sb.from("portfolio_awards").select("id");
  if (ex.error) return ex;
  const have = new Set((ex.data || []).map((r) => r.id));
  const keep = new Set();
  for (const [i, it] of items.entries()) {
    const cols = {
      title: it.title || "", issuer: it.issuer || "", image: it.image || "", description: it.description || "",
      date: it.date || "", sort_order: it.sortOrder ?? i, is_published: it.isPublished !== false,
    };
    if (it.id && have.has(it.id)) {
      const up = await sb.from("portfolio_awards").update(cols).eq("id", it.id);
      if (up.error) return up;
      keep.add(it.id);
    } else {
      const ins = await sb.from("portfolio_awards").insert(cols);
      if (ins.error) return ins;
    }
  }
  for (const id of have) {
    if (keep.has(id)) continue;
    const del = await sb.from("portfolio_awards").delete().eq("id", id);
    if (del.error) return del;
  }
  return { error: null };
}
