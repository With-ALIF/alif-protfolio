import { getResumeInfo } from "@/lib/cms";

export const dynamic = "force-dynamic";

function buildFilename({ name, handle }) {
  const base = String(name || handle || "Resume")
    .normalize("NFKD")
    .replace(/[^\w\s.-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);

  return `${base || "Resume"}-CV.pdf`;
}

export async function GET() {
  const resume = await getResumeInfo();

  if (!resume.url) {
    return new Response("Resume is not available.", { status: 404 });
  }

  let sourceUrl;
  try {
    sourceUrl = new URL(resume.url);
  } catch {
    return new Response("Resume is not available.", { status: 404 });
  }

  if (sourceUrl.protocol !== "http:" && sourceUrl.protocol !== "https:") {
    return new Response("Resume is not available.", { status: 404 });
  }

  let upstream;
  try {
    upstream = await fetch(sourceUrl, {
      cache: "no-store",
      headers: { "User-Agent": "alif-portfolio" },
    });
  } catch {
    return new Response("Resume could not be downloaded right now.", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("Resume could not be downloaded right now.", { status: 502 });
  }

  const filename = buildFilename(resume);
  const asciiFilename =
    filename.replace(/[^\x20-\x7E]/g, "").replace(/["\\]/g, "").trim() || "Resume-CV.pdf";

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
