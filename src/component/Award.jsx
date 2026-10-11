"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CalendarDays, Trophy, ArrowUpRight } from "lucide-react";

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const AwardsSection = ({ items }) => {
  const visibleAwards = (items ?? [])
    .filter((award) => award.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <motion.div
      className="relative mx-auto w-full max-w-screen-xl px-4 text-white sm:px-6"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Ambient glow behind the section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-blue-500/15 blur-[100px]"
      />

      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-blue-300">
          <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
          Recognition
        </span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
          My{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Achievements
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
          Certificates and recognitions that mark my learning journey and participation in different
          events and programs.
        </p>
      </div>

      {/* Cards: mobile scrolls horizontally, desktop shows two per row */}
      <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0">
        {visibleAwards.map((award, index) => (
          <motion.article
            key={award.id ?? index}
            className="group relative w-[88%] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950 p-4 shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-blue-500/10 sm:w-auto sm:p-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.24) }}
          >
            {/* Top highlight line */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />

            {award.image ? (
              <a
                href={award.image}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block"
                aria-label={`Open ${award.title} certificate`}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10 bg-black/40">
                  <Image
                    src={award.image}
                    alt={`${award.title} certificate`}
                    fill
                    sizes="(max-width: 640px) 88vw, 45vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </a>
            ) : null}

            <div className="mt-5 flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/25 to-cyan-400/10 ring-1 ring-inset ring-blue-400/20">
                <Trophy className="h-4 w-4 text-blue-300" aria-hidden="true" />
              </span>
              <div className="min-w-0 min-h-[5.5rem] sm:min-h-[6.25rem]">
                <h3 className="text-base font-semibold leading-snug text-white sm:text-lg">
                  {award.title}
                </h3>
                {award.issuer ? (
                  <p className="mt-0.5 text-sm font-medium text-blue-400">{award.issuer}</p>
                ) : null}
                {award.date ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-400/20">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <time dateTime={String(award.date).slice(0, 10)}>{formatDate(award.date)}</time>
                  </p>
                ) : null}
              </div>
            </div>

            {award.description ? (
              <div
                className="mt-5 border-t border-white/10 pt-4 text-[13px] leading-[1.65] text-zinc-400 [text-wrap:pretty] [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-zinc-200"
                dangerouslySetInnerHTML={{ __html: award.description }}
              />
            ) : null}
          </motion.article>
        ))}
      </div>
    </motion.div>
  );
};

export default AwardsSection;