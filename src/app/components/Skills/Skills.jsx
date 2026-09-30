import { motion } from "framer-motion";
import { Code2, Database, Layers, Sparkles, Wrench } from "lucide-react";
import { getSkillIcon } from "@/data/skillIcons";
import { skillGroups as localSkillGroups, toolsList } from "@/data/skills";

const normKey = (name) => String(name).toLowerCase().replace(/[^a-z0-9]/g, "");

const GROUP_STYLES = [
  {
    match: ["language"],
    icon: Code2,
    tile: "border-blue-400/30 bg-blue-500/15 text-blue-300",
    card: "hover:border-blue-400/30",
  },
  {
    match: ["framework", "library"],
    icon: Layers,
    tile: "border-violet-400/30 bg-violet-500/15 text-violet-300",
    card: "hover:border-violet-400/30",
  },
  {
    match: ["backend", "service", "database"],
    icon: Database,
    tile: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
    card: "hover:border-emerald-400/30",
  },
  {
    match: ["tool"],
    icon: Wrench,
    tile: "border-amber-400/30 bg-amber-500/15 text-amber-300",
    card: "hover:border-amber-400/30",
  },
];

const FALLBACK_STYLE = {
  icon: Sparkles,
  tile: "border-zinc-400/30 bg-white/10 text-zinc-300",
  card: "hover:border-zinc-400/30",
};

const styleFor = (title) => {
  const t = String(title || "").toLowerCase();
  return GROUP_STYLES.find((g) => g.match.some((m) => t.includes(m))) || FALLBACK_STYLE;
};

export default function Skills({ groups, tagIcons }) {
  const visibleGroups = groups ?? [
    ...localSkillGroups,
    { title: "Tools", skills: toolsList },
  ];

  return (
    <section className="space-y-10 text-white">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-4xl font-bold tracking-normal text-transparent sm:text-5xl">
          Technical skills
        </h2>
        <p className="mt-3 text-xl font-semibold text-zinc-100">
          A practical full-stack toolkit
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
          Skills are grouped by how I use them in real projects, from frontend implementation to APIs, databases, testing, and deployment.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {visibleGroups.map((group, idx) => {
          const style = styleFor(group.title);
          const GroupIcon = style.icon;
          return (
            <motion.section
              key={group.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.4, delay: Math.min(idx * 0.07, 0.28) }}
              className={`rounded-xl border border-white/10 bg-zinc-900/70 p-5 transition-colors sm:p-6 ${style.card}`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${style.tile}`}>
                  <GroupIcon className="h-5 w-5" />
                </span>
                <h3 className="min-w-0 flex-1 truncate text-xl font-semibold sm:text-2xl">{group.title}</h3>
                <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
                  {group.skills?.length || 0}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:gap-2.5">
                {group.skills.map((skill) => {
                  const icon = tagIcons?.[normKey(skill)] || getSkillIcon(skill);

                  return (
                    <div
                      key={`${group.title}-${skill}`}
                      className="group/skill flex min-w-0 items-center justify-center gap-2 rounded-lg border border-white/10 bg-black/20 px-2 py-2.5 text-center transition duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/40 sm:justify-start sm:gap-2.5 sm:p-3 sm:text-left"
                    >
                      {icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={icon}
                          alt=""
                          width={20}
                          height={20}
                          loading="lazy"
                          className="h-5 w-5 shrink-0 object-contain transition duration-200 group-hover/skill:scale-110"
                        />
                      ) : null}
                      <p className="truncate text-sm font-medium sm:text-base">{skill}</p>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </div>
    </section>
  );
}
