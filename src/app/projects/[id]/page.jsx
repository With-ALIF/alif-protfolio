import Image from "next/image";
import { AlertTriangle, ArrowLeft, Database, ExternalLink, Github, History, Images, Layers, LayoutDashboard, Lightbulb, Link2, ListChecks } from "lucide-react";
import { projects as localProjects, getCaseStudy as localGetCaseStudy } from "@/data/projects";
import { getCmsBundle } from "@/lib/cms";

export const dynamic = "force-dynamic";

const Section = ({ icon: Icon, title, children }) => (
  <section className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
    <h2 className="flex items-center gap-2 text-2xl font-semibold">
      {Icon ? <Icon className="h-6 w-6 text-blue-300" /> : null}
      {title}
    </h2>
    <div className="mt-4 text-zinc-300">{children}</div>
  </section>
);

const Paragraphs = ({ text, splitAll = false }) => {
  const parts = String(text || "")
    .split(splitAll ? /\n+/ : /\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <>
      {parts.map((part, index) => (
        <p key={part} className={`leading-7 ${index > 0 ? "mt-4" : ""}`}>
          {part}
        </p>
      ))}
    </>
  );
};

export default async function ProjectDetails({ params }) {
  const { id } = await params;
  const cms = await getCmsBundle();
  const project =
    (cms.projects || []).find((item) => item.id === id) ||
    localProjects.find((item) => item.id === id);
  const study = cms.studies?.[id] || localGetCaseStudy(id);

  if (!project && !study) {
    return (
      <div className="mx-auto max-w-2xl py-24 text-center text-white">
        <h1 className="text-3xl font-bold">Project not found</h1>
        <a
          href="/#projects"
          className="mt-6 inline-flex items-center gap-2 text-blue-300 hover:text-blue-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </a>
      </div>
    );
  }

  const title = study?.title || project?.title;
  const description = study?.description || project?.description;
  const fullDescription = study?.full_description || "";
  const thumbnail = study?.thumbnail_url || project?.image;
  const tags = study?.tags || project?.tags || [];
  const status = study?.status || (project?.isPublished ? "Published" : "Draft");
  const technologies = study?.technologies || [];
  const features = study?.features || [];
  const gallery = study?.gallery || [];
  const timeline = study?.timeline || [];
  const challenges = study?.challenges || [];
  const solutions = study?.solutions || [];
  const statistics = study?.statistics || {};
  const databaseInfo = study?.database_info || {};

  const githubUrl = study?.github_url || project?.github || "";
  const demoUrl = study?.demo_url || project?.demo || "";
  const showGithub = Boolean(githubUrl) && (study ? study.show_github : Boolean(project?.showGithub));
  const showDemo = Boolean(demoUrl) && (study ? study.show_demo : true);

  const links = [
    showDemo
      ? { label: "Live Demo", href: demoUrl, icon: ExternalLink }
      : null,
    showGithub ? { label: "GitHub", href: githubUrl, icon: Github } : null,
  ].filter(Boolean);

  const statisticsEntries = Object.entries(statistics);

  return (
    <article className="space-y-8 text-white">
      <a
        href="/#projects"
        className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </a>

      <header className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
        <div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-normal sm:text-5xl">{title}</h1>
          <p className="mt-5 text-lg leading-8 text-zinc-300">{description}</p>
          {links.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {links.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 font-semibold hover:bg-white/10"
                >
                  <Icon className="h-4 w-4" /> {label}
                </a>
              ))}
            </div>
          )}
        </div>
        <Image
          src={thumbnail}
          alt={`${title} preview`}
          width={900}
          height={600}
          className="aspect-video w-full rounded-lg object-cover"
          priority
        />
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm text-zinc-400">Status</p>
          <p className="mt-1 font-semibold">{status}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm text-zinc-400">Technologies</p>
          <p className="mt-1 font-semibold">
            {technologies.length > 0 ? technologies.length : tags.length}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm text-zinc-400">Key Features</p>
          <p className="mt-1 font-semibold">{features.length}</p>
        </div>
      </div>

      {fullDescription && (
        <Section icon={LayoutDashboard} title="Overview">
          <Paragraphs text={fullDescription} />
        </Section>
      )}

      {statisticsEntries.length > 0 && (
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statisticsEntries.map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-center"
            >
              <p className="text-2xl font-bold text-blue-200">{value}</p>
              <p className="mt-1 text-sm text-zinc-400">{label}</p>
            </div>
          ))}
        </section>
      )}

      {features.length > 0 && (
        <Section icon={ListChecks} title="Key Features">
          <ul className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <li
                key={feature}
                className="rounded-md border border-white/10 bg-black/20 p-3"
              >
                {feature}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {technologies.length > 0 && (
        <Section icon={Layers} title="Tech Stack">
          <div className="flex flex-wrap gap-3">
            {technologies.map((tech) => (
              <span
                key={tech.name}
                className="inline-flex items-center gap-2 rounded-md bg-blue-500/15 px-3 py-2 text-sm text-blue-100"
              >
                {tech.icon ? (
                  <Image
                    src={tech.icon}
                    alt={tech.name}
                    width={20}
                    height={20}
                    className="h-5 w-5 object-contain"
                  />
                ) : null}
                {tech.name}
              </span>
            ))}
          </div>
        </Section>
      )}

      {gallery.length > 0 && (
        <Section icon={Images} title="Screenshots">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((item, index) => (
              <figure key={item.image} className="overflow-hidden rounded-md border border-white/10">
                <Image
                  src={item.image}
                  alt={item.title || `${title} screenshot ${index + 1}`}
                  width={700}
                  height={420}
                  className="aspect-video w-full object-cover"
                />
                {item.title && (
                  <figcaption className="px-3 py-2 text-sm text-zinc-400">
                    {item.title}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </Section>
      )}

      {timeline.length > 0 && (
        <Section icon={History} title="Timeline">
          <div className="space-y-4">
            {timeline.map((item) => (
              <div
                key={`${item.date}-${item.title}`}
                className="rounded-lg border border-white/10 bg-black/20 p-4"
              >
                <div className="flex gap-4">
                  <span className="flex h-10 w-fit shrink-0 items-center justify-center rounded-full bg-green-500/15 px-3 text-sm font-semibold text-green-200">
                    {item.date}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 leading-6 text-zinc-400">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {challenges.length > 0 && (
          <Section icon={AlertTriangle} title="Challenges">
            <ul className="list-disc space-y-2 pl-5">
              {challenges.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        )}
        {solutions.length > 0 && (
          <Section icon={Lightbulb} title="Solutions">
            <ul className="list-disc space-y-2 pl-5">
              {solutions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {study?.show_database && databaseInfo?.name && (
        <section className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3">
            {databaseInfo.icon ? (
              <Image
                src={databaseInfo.icon}
                alt={databaseInfo.name}
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <Database className="h-6 w-6 text-blue-300" />
            )}
            <h2 className="text-2xl font-semibold">{databaseInfo.name}</h2>
          </div>
          <div className="mt-4 text-zinc-300">
            <Paragraphs text={databaseInfo.description} splitAll />
          </div>
        </section>
      )}

      {links.length > 0 && (
        <Section icon={Link2} title="Links">
          <div className="flex flex-wrap gap-3">
            {links.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 font-semibold hover:bg-white/10"
              >
                <Icon className="h-4 w-4" /> {label}
              </a>
            ))}
          </div>
        </Section>
      )}
    </article>
  );
}
