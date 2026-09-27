"use client";
import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { blankFor, blankSiteData, normalizeSiteData, pretty } from "./format/data";
import { buildPayload } from "./format/payload";
import { SITE_SECTIONS } from "./tables";
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
    const { data, error: err } = await sb.from(activeName).select("*").order(table.orderBy, { ascending: true });
    if (err) {
      setError(err.message);
      setRows([]);
    } else setRows(data || []);
    if (activeName === "alif_project_details") {
      const { data: projs } = await sb.from("alif_projects").select("id,title,slug").order("sort_order");
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
    setForm((f) => (key === "section" && activeName === "alif_site_content" ? { ...f, section: value, data: normalizeSiteData(value, f.data) } : { ...f, [key]: value }));
  const handleSave = async () => {
    setSaving(true);
    resetMsg();
    try {
      const sb = getSupabase();
      const payload = buildPayload(table, form);
      const q = isNew ? await sb.from(activeName).insert(payload) : await sb.from(activeName).update(payload).eq("id", editing.id);
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
    const { error: err } = await sb.from(activeName).delete().eq("id", row.id);
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
