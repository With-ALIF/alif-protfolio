"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { inputCls } from "../format/ui";
import { compressAndUpload } from "../lib/images";

export default function ImageInput({ value, onChange, placeholder }) {
  const fileRef = useRef(null);
  const [status, setStatus] = useState("");
  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setStatus("Compressing to 100KB…");
    try {
      const { url, bytes } = await compressAndUpload(file);
      onChange(url);
      setStatus(`Uploaded (${(bytes / 1024).toFixed(0)}KB)`);
    } catch (err) {
      setStatus(err.message || "Upload failed.");
    }
  };
  return (
    <div>
      <div className="flex gap-2">
        <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "https://…"} className={`${inputCls} min-w-0`} />
        <button type="button" onClick={() => fileRef.current?.click()} title="Upload & auto-resize to 100KB" className="mt-2 flex shrink-0 items-center gap-1 rounded-lg border border-white/15 px-3 text-sm hover:bg-white/10">
          <Upload size={16} /> Upload
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={pick} className="hidden" />
      </div>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="preview" className="mt-2 h-16 w-16 rounded-lg border border-white/10 object-cover" />
      ) : null}
      {status ? <p className="mt-1 text-xs text-zinc-500">{status}</p> : <p className="mt-1 text-xs text-zinc-600">Upload = auto resize to ≤100KB.</p>}
    </div>
  );
}
