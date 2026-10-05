"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Github, Globe } from "lucide-react";
import { renderRich } from "@/lib/richText";

// The project card is a summary, so it only surfaces the core stack. A chip
// qualifies when its category name contains one of these words (case and
// spacing insensitive), so "Frontend", "Backend Services" and "Programming
// Language" all match. Everything else stays on the project's detail page.
const CARD_CATEGORY_KEYWORDS = ["frontend", "backend", "language"];

const onCard = (tech) => {
  const category = String(tech?.categoryName || "").toLowerCase().trim();
  return CARD_CATEGORY_KEYWORDS.some((k) => category.includes(k));
};

const ProjectCard = ({ project, study: studyProp, techStack }) => {
  const study = studyProp;
  const showGithub = Boolean(project.showGithub && project.github);
  const showDemo = Boolean(project.demo);
  const all = (Array.isArray(techStack) && techStack.length > 0 ? techStack : study?.technologies) || [];
  const stack = all.filter((t) => t?.name).filter(onCard);
  const summary = project.description || "";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-900/80 transition hover:-translate-y-1 hover:border-blue-400/40">
      {project.image ? (
        <Link href={`/projects/${project.id}`} className="block overflow-hidden">
          <Image
            src={project.image}
            alt={`${project.title} project preview`}
            width={800}
            height={500}
            className="aspect-video w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-blue-500/20 to-zinc-800 text-4xl font-bold text-zinc-600">
          {project.title?.[0] || "?"}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {study?.status && (
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                String(study.status).toLowerCase().includes("complet")
                  ? "border border-emerald-400/30 bg-emerald-500/10 font-semibold text-emerald-200"
                  : "bg-white/10 text-zinc-300"
              }`}
            >
              {study.status}
            </span>
          </div>
        )}

        <h2 className="mt-4 text-2xl font-semibold text-white">{project.title}</h2>
        {summary && <p className="mt-3 flex-1 text-sm leading-6 text-zinc-300">{renderRich(summary)}</p>}

        {stack.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Tech Stack</p>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {stack.map((t) => (
                <span
                  key={t.name}
                  className="flex min-w-0 items-center justify-center gap-1 rounded-md border border-white/10 bg-black/20 px-1.5 py-1.5 text-xs text-zinc-300"
                >
                  {t.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.icon} alt="" width={14} height={14} loading="lazy" className="h-3.5 w-3.5 shrink-0 object-contain" />
                  ) : null}
                  <span className="truncate">{t.name}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          {showDemo ? (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold hover:bg-blue-400"
            >
              <Globe className="h-4 w-4" /> Live
            </a>
          ) : (
            <span className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-500">
              No demo
            </span>
          )}
          {showGithub ? (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              <Github className="h-4 w-4" /> GitHub
            </a>
          ) : (
            <span className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-500">
              Private repo
            </span>
          )}
          <Link
            href={`/projects/${project.id}`}
            className="col-span-2 inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            Case Study <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
