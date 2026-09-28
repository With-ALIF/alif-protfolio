import Image from "next/image";
import { getSkillIcon } from "@/data/skillIcons";
import { skillGroups as localSkillGroups, toolsList } from "@/data/skills";

const normKey = (name) => String(name).toLowerCase().replace(/[^a-z0-9]/g, "");

export default function Skills({ groups, tagIcons }) {
  const visibleGroups = groups ?? [
    ...localSkillGroups,
    { title: "Tools", skills: toolsList },
  ];
  return (
    <section className="space-y-12 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-4xl font-bold tracking-normal text-blue-300 sm:text-5xl">Technical skills</p>
        <h1 className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">A practical full-stack toolkit</h1>
        <p className="mt-4 text-zinc-300">
          Skills are grouped by how I use them in real projects, from frontend implementation to APIs, databases, testing, and deployment.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {visibleGroups.map((group) => (
          <section key={group.title} className="rounded-lg border border-white/10 bg-zinc-900/70 p-5 sm:p-6">
            <h2 className="text-xl font-semibold sm:text-2xl">{group.title}</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:flex sm:flex-wrap sm:gap-3">
              {group.skills.map((skill) => {
                const icon = tagIcons?.[normKey(skill)] || getSkillIcon(skill);

                return (
                  <div
                    key={`${group.title}-${skill}`}
                    className="flex min-w-0 items-center justify-center gap-2 rounded-lg border border-white/10 bg-black/20 px-2 py-2.5 text-center sm:justify-start sm:gap-2.5 sm:p-3 sm:text-left"
                  >
                    {icon ? (
                      <Image
                        src={icon}
                        alt=""
                        width={20}
                        height={20}
                        className="h-5 w-5 shrink-0 object-contain"
                      />
                    ) : null}
                    <p className="truncate text-sm font-medium sm:text-base">{skill}</p>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
