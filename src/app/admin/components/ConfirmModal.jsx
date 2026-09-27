"use client";

export default function ConfirmModal({ title, message, confirmLabel = "Delete", onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-lg border border-white/10 bg-zinc-900 p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        {message ? <p className="mt-2 text-sm leading-6 text-zinc-400">{message}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-full border border-white/15 px-5 py-2 text-sm hover:bg-white/10">
            Cancel
          </button>
          <button onClick={onConfirm} className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold hover:bg-red-400">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
