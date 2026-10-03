"use client";

const GUIDE = {
  alif_site_content: {
    title: "Site Content images",
    rows: [
      {
        field: "profile → profileImage",
        format: "JPG / WebP (PNG accepted, converted to WebP)",
        ratio: "1 : 1 (square)",
        size: "Recommended 720 × 720 px · Min 480 × 480 px",
        note: "Shown as a square card on Home (~170 px) and as a portrait on About (560 × 720, object-cover). Keep the face centered with margin.",
      },
    ],
  },
  alif_projects: {
    title: "Projects images",
    rows: [
      {
        field: "image",
        format: "WebP / JPG (PNG accepted, converted to WebP)",
        ratio: "16 : 9 (landscape)",
        size: "Recommended 1280 × 720 px · Min 800 × 450 px",
        note: "Card preview uses aspect-video + object-cover with hover zoom. Landscape screenshots work best.",
      },
    ],
  },
  alif_project_details: {
    title: "Project Details images",
    rows: [
      {
        field: "thumbnail_url",
        format: "WebP / JPG",
        ratio: "16 : 9 (landscape)",
        size: "Recommended 1280 × 720 px · Min 800 × 450 px",
        note: "Hero banner on the case-study page (aspect-video, object-cover).",
      },
      {
        field: "gallery → image",
        format: "WebP / JPG",
        ratio: "16 : 9 (landscape)",
        size: "Recommended 1280 × 720 px · Min 800 × 450 px",
        note: "Screenshots grid (1 / 2 / 3 columns, aspect-video). Use same size for a uniform grid.",
      },
      {
        field: "technologies → icon",
        format: "PNG with transparency preferred (WebP ok)",
        ratio: "1 : 1 (square)",
        size: "Recommended 128 × 128 px · Min 64 × 64 px",
        note: "Rendered at ~24 px with object-contain, so no cropping. Square icons only.",
      },
    ],
  },
  alif_education: {
    title: "Education images",
    rows: [
      {
        field: "logo",
        format: "PNG / JPG / WebP",
        ratio: "1 : 1 (square)",
        size: "Recommended 256 × 256 px · Min 128 × 128 px",
        note: "Shown as a 48 px circle (object-cover). Center the logo with padding so the circle crop never cuts it.",
      },
    ],
  },
  alif_experience: {
    title: "Experience images",
    rows: [
      {
        field: "logo",
        format: "PNG / JPG / WebP",
        ratio: "1 : 1 (square)",
        size: "Recommended 256 × 256 px · Min 128 × 128 px",
        note: "Shown as a 40 px circle (object-cover). Same rule: centered subject + padding.",
      },
    ],
  },
  alif_skills: {
    title: "Skills / Tools icons",
    rows: [
      {
        field: "via Icons table (tag link)",
        format: "PNG with transparency preferred",
        ratio: "1 : 1 (square)",
        size: "Recommended 128 × 128 px · Min 64 × 64 px",
        note: "Tiny badges (~14–24 px, object-contain). Upload square icons only.",
      },
    ],
  },
  alif_tools: {
    title: "Skills / Tools icons",
    rows: [
      {
        field: "via Icons table (tag link)",
        format: "PNG with transparency preferred",
        ratio: "1 : 1 (square)",
        size: "Recommended 128 × 128 px · Min 64 × 64 px",
        note: "Tiny badges (~14–24 px, object-contain). Upload square icons only.",
      },
    ],
  },
  alif_tag: {
    title: "Icons images",
    rows: [
      {
        field: "icon",
        format: "PNG with transparency preferred (WebP ok)",
        ratio: "1 : 1 (square)",
        size: "Recommended 128 × 128 px · Min 64 × 64 px",
        note: "Source for every tech badge. Square, centered, transparent background gives the cleanest result.",
      },
    ],
  },
  alif_reviews: {
    title: "Reviews images",
    rows: [
      {
        field: "image (avatar)",
        format: "JPG / WebP (PNG accepted)",
        ratio: "1 : 1 (square)",
        size: "Recommended 256 × 256 px · Min 128 × 128 px",
        note: "Reviewer avatar, circle-cropped. Use a clear headshot with the face centered.",
      },
    ],
  },
  alif_journey: {
    title: "Journey",
    rows: [
      {
        field: "—",
        format: "No image field",
        ratio: "—",
        size: "—",
        note: "This section is text-only (year label + title + description). No upload needed.",
      },
    ],
  },
  alif_services: {
    title: "Services",
    rows: [
      {
        field: "—",
        format: "No image field (icon select: code / monitor / brush / wrench)",
        ratio: "—",
        size: "—",
        note: "This section uses built-in Lucide icons. No upload needed.",
      },
    ],
  },
};

export default function ImageGuide({ activeName }) {
  const guide = GUIDE[activeName];

  return (
    <aside className="rounded-lg border border-white/10 bg-zinc-900/60 p-4">
      <h2 className="font-semibold">Image Guide</h2>
      <p className="mt-1 text-xs leading-5 text-zinc-400">
        Upload system: any image is auto-compressed to <span className="text-zinc-200">WebP</span> (JPEG fallback),
        longest side max <span className="text-zinc-200">1280 px</span>, final file{" "}
        <span className="text-zinc-200">≤ 100 KB</span>, stored in the Supabase{" "}
        <span className="text-zinc-200">alif-images</span> bucket.
      </p>

      {guide ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-blue-300">{guide.title}</p>
          {guide.rows.map((row) => (
            <div key={row.field} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm">
              <p className="font-semibold text-white">{row.field}</p>
              <dl className="mt-2 space-y-1.5 text-xs leading-5">
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 font-semibold uppercase tracking-wide text-zinc-500">Format</dt>
                  <dd className="text-zinc-300">{row.format}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 font-semibold uppercase tracking-wide text-zinc-500">Ratio</dt>
                  <dd className="text-zinc-300">{row.ratio}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-14 shrink-0 font-semibold uppercase tracking-wide text-zinc-500">Size</dt>
                  <dd className="text-zinc-300">{row.size}</dd>
                </div>
              </dl>
              <p className="mt-2 border-t border-white/10 pt-2 text-xs leading-5 text-zinc-400">{row.note}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 rounded-lg border border-blue-400/20 bg-blue-500/10 p-3 text-xs leading-5 text-blue-100/90">
        Tip: the site crops with <span className="font-semibold">object-cover</span> (cards, avatars, banners).
        Always leave safe margin around the subject. Icons use <span className="font-semibold">object-contain</span>,
        so square transparent PNGs look sharpest.
      </div>
    </aside>
  );
}
