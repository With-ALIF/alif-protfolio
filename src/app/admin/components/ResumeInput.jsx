"use client";

import { useRef, useState } from "react";
import { ExternalLink, Upload } from "lucide-react";
import { inputCls } from "../format/ui";
import { MAX_RESUME_BYTES, uploadResumePdf } from "../lib/files";

export default function ResumeInput({ value, onChange }) {
  const fileRef = useRef(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const pick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setStatus("");
    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
      setStatus("Please choose a PDF file.");
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setStatus("PDF must be 5MB or smaller.");
      return;
    }

    setBusy(true);
    setStatus("Uploading PDF...");
    try {
      const url = await uploadResumePdf(file);
      onChange(url);
      setStatus("PDF uploaded. Save the section to publish it.");
    } catch (error) {
      setStatus(error.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://…/resume.pdf"
          className={`${inputCls} min-w-0`}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          title="Upload a PDF resume (max 5MB)"
          className="mt-2 flex shrink-0 items-center gap-1 rounded-lg border border-white/15 px-3 text-sm hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload size={16} />
          {busy ? "Uploading…" : "Upload PDF"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={pick}
          className="hidden"
        />
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {status ? (
          <p className="text-zinc-500">{status}</p>
        ) : (
          <p className="text-zinc-600">PDF only, up to 5MB.</p>
        )}
        {value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200"
          >
            <ExternalLink size={12} /> Open current resume
          </a>
        ) : null}
      </div>
    </div>
  );
}
