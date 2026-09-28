"use client";
import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { blankFor, blankSiteData, normalizeSiteData, pretty } from "./format/data";
import { buildPayload } from "./format/payload";
import { SITE_SECTIONS } from "./tables";
import { deleteRow, insertRow, loadProjectOptions, loadRows, updateRow } from "./store";

export const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function useAdminTable(table, activeName) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [projectOptions, setProjectOptions] = useState([]);
  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    const { data, error: err } = await loadRows(sb, activeName, table.orderBy);
    if (err) {
      setError(err.message);
      setRows([]);
    } else setRows(data || []);
    if (activeName === "alif_project_details") {
      const { data: projs } = await loadProjectOptions(sb);
      setProjectOptions(projs || []);
    }
    setLoading(false);
  }, [activeName, table]);
  useEffect(() => {
    setEditing(null);
    setNotice("");
    load();
  }, [load]);
  const resetMsg = () => {
    setError("");
    setNotice("");
  };
  const startNew = () => {
    setIsNew(true);
    const blank = blankFor(table);
    if (table.name === "alif_site_content") {
      const used = new Set(rows.map((r) => r.section));
      blank.section = SITE_SECTIONS.find((s) => !used.has(s)) || SITE_SECTIONS[0];
      blank.data = blankSiteData(blank.section);
    }
    setForm(blank);
    setEditing({});
    resetMsg();
  };
  const startEdit = (row) => {
    const obj = {};
    for (const f of table.fields) obj[f.key] = f.key === "data" && table.name === "alif_site_content" ? normalizeSiteData(row.section, row[f.key]) : pretty(f, row[f.key]);
    setIsNew(false);
    setForm(obj);
    setEditing(row);
    resetMsg();
  };
  const setField = (key, value) =>
    setForm((f) => {
      if (key === "section" && activeName === "alif_site_content")
        return { ...f, section: value, data: normalizeSiteData(value, f.data) };
      if (key === "title" && (activeName === "alif_project_details" || activeName === "alif_projects")) {
        // Slug follows the title automatically unless it was already customized.
        const current = f.slug || "";
        const follow = !current || current === slugify(f.title || "");
        return { ...f, title: value, ...(follow ? { slug: slugify(value) } : {}) };
      }
      return { ...f, [key]: value };
    });
  const handleSave = async () => {
    setSaving(true);
    resetMsg();
    try {
      const sb = getSupabase();
      const payload = buildPayload(table, form);
      if (activeName === "alif_project_details") {
        if (!payload.slug) payload.slug = slugify(payload.title || "");
        if (!payload.project_id && payload.slug) {
          const match = projectOptions.find((p) => p.slug === payload.slug);
          if (match) payload.project_id = match.id;
        }
      }
      if (activeName === "alif_projects" && !payload.slug) payload.slug = slugify(payload.title || "");
      const q = isNew ? await insertRow(sb, activeName, payload) : await updateRow(sb, activeName, editing.id, payload);
      if (q.error) throw q.error;
      setNotice(isNew ? "Added." : "Saved.");
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (row) => {
    resetMsg();
    const sb = getSupabase();
    const { error: err } = await deleteRow(sb, activeName, row);
    if (err) {
      setError(err.message);
      return;
    }
    if (editing?.id === row.id) setEditing(null);
    setNotice("Deleted.");
    await load();
  };
  return { rows, loading, editing, isNew, form, saving, error, notice, projectOptions, setEditing, setNotice, startNew, startEdit, setField, handleSave, handleDelete };
}
