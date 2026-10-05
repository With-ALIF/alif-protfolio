import Image from "next/image";
import { AlertTriangle, ArrowLeft, Boxes, ChevronRight, Database, ExternalLink, Github, History, Images, Layers, LayoutDashboard, Lightbulb, Link2, ListChecks } from "lucide-react";
import { getCmsBundle } from "@/lib/cms";
import { renderRich } from "@/lib/richText";

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

// Category accent colours. Assigned from the category NAME, so the same
// category always gets the same colour on every project and no colour or
// category name is hardcoded anywhere.
const TONES = [
  { text: "text-sky-300", edge: "border-sky-400/70" },
  { text: "text-emerald-300", edge: "border-emerald-400/70" },
  { text: "text-amber-300", edge: "border-amber-400/70" },
  { text: "text-violet-300", edge: "border-violet-400/70" },
  { text: "text-rose-300", edge: "border-rose-400/70" },
  { text: "text-cyan-300", edge: "border-cyan-400/70" },
  { text: "text-orange-300", edge: "border-orange-400/70" },
  { text: "text-lime-300", edge: "border-lime-400/70" },
];

const toneFor = (key) => {
  let h = 5381;
  for (const ch of String(key || "")) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
};

const Paragraphs = ({ text, splitAll = false, className = "" }) => {
  const parts = String(text || "")
    .split(splitAll ? /\n+/ : /\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <>
      {parts.map((part, index) => (
        <p key={part} className={`leading-7 ${index > 0 ? "mt-4" : ""} ${className}`}>
          {renderRich(part)}
        </p>
      ))}
    </>
  );
};

export default async function ProjectDetails({ params }) {
  const { id } = await params;
  const cms = await getCmsBundle();
  const project = (cms.projects || []).find((item) => item.id === id);
  const study = cms.studies?.[id];

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
  const status = study?.status || (project?.isPublished ? "Published" : "Draft");
  const technologies = study?.technologies || [];
  const techCategories = study?.techCategories || [];
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
          <h1 className="mt-4 text-4xl font-bold tracking-normal sm:text-5xl">{title}</h1>
          <p className="mt-5 text-justify text-lg leading-8 text-zinc-300">{renderRich(description)}</p>
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
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={`${title} preview`}
            width={900}
            height={600}
            className="aspect-video w-full rounded-lg object-cover"
            priority
          />
        ) : null}
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm text-zinc-400">Status</p>
          <p className="mt-1 font-semibold">{status}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm text-zinc-400">Technologies</p>
          <p className="mt-1 font-semibold">
            {technologies.length}
          </p>
        </div>
      </div>

      {fullDescription && (
        <Section icon={LayoutDashboard} title="Overview">
          <Paragraphs text={fullDescription} className="text-justify" />
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
                {renderRich(feature)}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {techCategories.length > 0 && (
        <Section icon={Layers} title="Technology Stack">
          {/* Stacked on mobile, side-by-side columns from lg up. A grid (not CSS
              columns) keeps the admin-defined category order intact. */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {techCategories.map((group, gi) => {
              const chips = (group.technologies || []).filter((t) => t.name);
              if (chips.length === 0) return null;
              const tone = toneFor(group.name || `uncategorised-${gi}`);
              return (
                <div
                  key={group.id || `loose-${gi}`}
                  className={`rounded-lg border border-white/10 border-l-2 ${group.name ? tone.edge : "border-l-white/15"} bg-black/20 p-4`}
                >
                  {group.name ? (
                    <h3 className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${tone.text}`}>
                      <Boxes className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{group.name}</span>
                    </h3>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {chips.map((tech) => (
                      <span
                        key={tech.name}
                        className="group/tech inline-flex min-w-0 max-w-full items-center gap-2 rounded-md border border-white/10 bg-black/30 px-2.5 py-1.5 text-sm font-medium text-zinc-200 transition duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06] hover:shadow-md hover:shadow-black/40"
                      >
                        {tech.icon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={tech.icon}
                            alt=""
                            width={16}
                            height={16}
                            loading="lazy"
                            className="h-4 w-4 shrink-0 object-contain transition duration-200 group-hover/tech:scale-110"
                          />
                        ) : null}
                        <span className="truncate">{tech.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {gallery.length > 0 && (
        <Section icon={Images} title="Screenshots">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((item, index) => (
              <figure key={item.image || `${title}-${index}`} className="overflow-hidden rounded-md border border-white/10">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title || `${title} screenshot ${index + 1}`}
                    width={700}
                    height={420}
                    className="aspect-video w-full object-cover"
                  />
                ) : null}
                {item.title && (
                  <figcaption className="px-3 py-2 text-sm text-zinc-400">
                    {renderRich(item.title)}
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
                    <p className="mt-2 leading-6 text-zinc-400 [text-wrap:pretty]">{renderRich(item.detail)}</p>
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
            <ul className="space-y-3">
              {challenges.map((item) => (
                <li key={item} className="flex gap-2 text-justify">
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-amber-300" />
                  <span>{renderRich(item)}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
        {solutions.length > 0 && (
          <Section icon={Lightbulb} title="Solutions">
            <ul className="space-y-3">
              {solutions.map((item) => (
                <li key={item} className="flex gap-2 text-justify">
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>{renderRich(item)}</span>
                </li>
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
            <Paragraphs text={databaseInfo.description} splitAll className="text-justify" />
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
