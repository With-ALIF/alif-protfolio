"use client";

import { getSupabase } from "@/lib/supabase";
import { IMAGE_BUCKET } from "./images";

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

function isPdf(file) {
  return file?.type === "application/pdf" || /\.pdf$/i.test(file?.name || "");
}

export async function uploadResumePdf(file) {
  if (!isPdf(file)) throw new Error("Only PDF files are allowed.");
  if (file.size > MAX_RESUME_BYTES) throw new Error("PDF must be 5MB or smaller.");

  const sb = getSupabase();
  if (!sb) throw new Error("Supabase is not configured.");

  const baseName =
    String(file.name || "resume")
      .replace(/\.pdf$/i, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "resume";
  const path = `resumes/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${baseName}.pdf`;

  const { error } = await sb.storage.from(IMAGE_BUCKET).upload(path, file, {
    contentType: "application/pdf",
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    throw new Error(
      `${error.message} (Run supabase/storage.sql and make sure the "${IMAGE_BUCKET}" bucket allows PDF uploads)`
    );
  }

  const { data } = sb.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
