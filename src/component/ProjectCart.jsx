"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Github, Globe } from "lucide-react";
import { getCaseStudy } from "@/data/projects";
import { getSkillIcon } from "@/data/skillIcons";

const normKey = (name) => String(name).toLowerCase().replace(/[^a-z0-9]/g, "");

const ProjectCard = ({ project, tagIcons }) => {
  const study = getCaseStudy(project.id);
  const showGithub = Boolean(project.showGithub && project.github);
  const showDemo = Boolean(project.demo);
  const features = study?.features?.slice(0, 3) ?? [];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-900/80 transition hover:-translate-y-1 hover:border-blue-400/40">
      <Link href={`/projects/${project.id}`} className="block overflow-hidden">
        <Image
          src={project.image}
          alt={`${project.title} project preview`}
          width={800}
          height={500}
          className="aspect-video w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {project.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200"
            >
              {tag}
            </span>
          ))}
          {study?.status && (
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                String(study.status).toLowerCase().includes("complet")
                  ? "border border-emerald-400/30 bg-emerald-500/10 font-semibold text-emerald-200"
                  : "bg-white/10 text-zinc-300"
              }`}
            >
              {study.status}
            </span>
          )}
        </div>

        <h2 className="mt-4 text-2xl font-semibold text-white">{project.title}</h2>
        <p className="mt-3 flex-1 text-sm leading-6 text-zinc-300">{project.description}</p>

        {features.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-zinc-300">
            {features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => {
            const icon = tagIcons?.[normKey(tag)] || getSkillIcon(tag);
            return (
              <span
                key={`${project.id}-${tag}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1 text-xs text-zinc-300"
              >
                {icon ? (
                  <Image
                    src={icon}
                    alt={`${tag} logo`}
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5 object-contain"
                  />
                ) : null}
                {tag}
              </span>
            );
          })}
        </div>

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
