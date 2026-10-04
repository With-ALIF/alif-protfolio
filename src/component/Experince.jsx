"use client";
import Image from "next/image";
import { motion } from "framer-motion";

const ExperienceSection = ({ items }) => {
  const list = [...(items ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="py-12 text-white">
      <div className="mx-auto max-w-4xl rounded-lg border border-white/10 bg-zinc-900/70 p-6 shadow-lg sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">
            Work history
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-normal">Experience</h2>
          <p className="mt-3 max-w-2xl leading-7 text-zinc-400">
            Professional roles where I worked on product features, full-stack development, and delivery.
          </p>
        </div>

        <div className="relative space-y-5 before:absolute before:left-5 before:top-3 before:h-[calc(100%-1.5rem)] before:w-px before:bg-white/10">
          {list.map((exp, index) => (
            <motion.div
              key={exp.id}
              className="relative grid grid-cols-[2.75rem_1fr] gap-4"
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <div className="relative z-10 mt-1 h-10 w-10 overflow-hidden rounded-full border border-blue-400/30 bg-blue-500/15 shadow-lg shadow-blue-950/20">
                {exp.logo ? (
                  <Image
                    src={exp.logo}
                    alt={`${exp.title} logo`}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="absolute inset-3 rounded-full bg-blue-300" />
                )}
              </div>

              <div className="rounded-lg border border-white/10 bg-black/20 p-4 transition hover:border-blue-400/30 hover:bg-white/[0.04] sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-blue-200">{exp.year}</p>
                  <span className="w-fit rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-zinc-300">
                    {exp.status}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-semibold leading-snug text-white">{exp.role}</h3>
                <p className="mt-2 leading-6 text-zinc-400">{exp.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperienceSection;
