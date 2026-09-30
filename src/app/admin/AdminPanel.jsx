"use client";

import { useState } from "react";
import { TABLES } from "./tables";
import { useAdminTable } from "./hooks";
import AdminHeader from "./components/AdminHeader";
import TableTabs from "./components/TableTabs";
import RowList, { StatusBanner } from "./components/RowList";
import EditorPanel from "./components/EditorPanel";
import ConfirmModal from "./components/ConfirmModal";
import { saveProjectAndSync, syncAllProjectsToDetails } from "./syncProject";

export default function AdminPanel({ user }) {
  const [activeName, setActiveName] = useState(TABLES[0].name);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [showSync, setShowSync] = useState(false);
  const table = TABLES.find((t) => t.name === activeName);
  const s = useAdminTable(table, activeName);

  // Core sections + education can never be deleted (any case).
  const canDelete = (row) => {
    if (activeName === "alif_site_content" && ["site", "hero", "about", "awards"].includes(row.section)) return false;
    if (activeName === "alif_education") return false;
    return true;
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await s.handleDelete(pendingDelete);
    setPendingDelete(null);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <AdminHeader user={user} />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <TableTabs tables={TABLES} activeName={activeName} onChange={setActiveName} />
        {activeName === "alif_projects" ? (
          <button onClick={() => setShowSync(true)} className="mt-3 rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10">
            Sync all → Details
          </button>
        ) : null}
        <StatusBanner error={s.error} notice={s.notice} />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <RowList
            key={table.name}
            table={table}
            rows={s.rows}
            loading={s.loading}
            editing={s.editing}
            onEdit={s.startEdit}
            onDelete={setPendingDelete}
            onNew={s.startNew}
            canDelete={canDelete}
            showAdd={activeName !== "alif_project_details"}
            showDelete={activeName !== "alif_project_details"}
          />
          <div className="rounded-lg border border-white/10 bg-zinc-900/60 p-4">
            <EditorPanel
              table={table}
              editing={s.editing}
              isNew={s.isNew}
              form={s.form}
              saving={s.saving}
              projectOptions={s.projectOptions}
              onField={s.setField}
              onSave={() => saveProjectAndSync(s, activeName)}
              onCancel={() => s.setEditing(null)}
            />
          </div>
        </div>
      </div>
      {pendingDelete ? (
        <ConfirmModal
          title={`Delete this ${table.label.slice(0, -1) || "row"}?`}
          message={`${table.listBy(pendingDelete)}${activeName === "alif_projects" ? " Its case-study details will be deleted too (cascade)." : ""}`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
      {showSync ? (
        <ConfirmModal
          title="Sync all projects to details?"
          message="Title, slug, description, image and tags of every project will be copied to its Project Details row."
          confirmLabel="Sync"
          onConfirm={async () => {
            setShowSync(false);
            await syncAllProjectsToDetails(s);
          }}
          onCancel={() => setShowSync(false)}
        />
      ) : null}
    </div>
  );
}
