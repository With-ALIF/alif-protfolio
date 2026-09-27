"use client";

import { getSupabase } from "@/lib/supabase";

export const MAX_IMAGE_BYTES = 100 * 1024;
export const IMAGE_BUCKET = "alif-images";

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

export async function compressTo100KB(file) {
  const img = await loadImage(file);
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  const maxDim = 1280;
  const scale0 = Math.min(1, maxDim / Math.max(w, h));
  w = Math.round(w * scale0);
  h = Math.round(h * scale0);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  let quality = 0.85;
  let type = "image/webp";
  for (let i = 0; i < 8; i++) {
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    let blob = await canvasToBlob(canvas, type, quality);
    if (!blob && type === "image/webp") {
      type = "image/jpeg";
      blob = await canvasToBlob(canvas, type, quality);
    }
    if (!blob) throw new Error("Image compress failed.");
    if (blob.size <= MAX_IMAGE_BYTES || (quality <= 0.35 && w < 320)) return blob;
    if (quality > 0.4) quality -= 0.12;
    else {
      w = Math.round(w * 0.85);
      h = Math.round(h * 0.85);
      quality = 0.8;
    }
  }
  // last try: return whatever we have
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);
  const blob = await canvasToBlob(canvas, type, 0.7);
  if (!blob) throw new Error("Image compress failed.");
  return blob;
}

export async function uploadCompressedImage(blob, name) {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase is not configured.");
  const ext = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
  const path = `${Date.now()}-${String(name || "img").replace(/[^a-z0-9.-]/gi, "_")}.${ext}`;
  const { error } = await sb.storage.from(IMAGE_BUCKET).upload(path, blob, { contentType: blob.type, upsert: false });
  if (error) throw new Error(`${error.message} (Run supabase/storage.sql to create the "${IMAGE_BUCKET}" bucket)`);
  const { data } = sb.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function compressAndUpload(file) {
  const blob = await compressTo100KB(file);
  return { url: await uploadCompressedImage(blob, file.name), bytes: blob.size };
}
