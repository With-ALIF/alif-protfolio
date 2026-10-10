"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CalendarDays, Trophy } from "lucide-react";

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
      className="mx-auto w-full max-w-screen-xl px-4 text-white sm:px-6"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header sits outside the card frame */}
      <h2 className="text-center text-3xl font-bold tracking-normal sm:text-4xl">
        My <span className="text-blue-400">Achievements</span>
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-6 text-zinc-400">
        Certificates and recognitions that mark my learning journey and participation in different events and
        programs.
      </p>

      {/* One frame around everything. The 3px gap over a light parent draws a slim
          divider, so the two cards sit next to each other without touching.
          Mobile scrolls, desktop shows two per row. */}
      <div className="mt-7 overflow-hidden rounded-xl border border-white/10">
        <div className="flex snap-x snap-mandatory gap-[3px] overflow-x-auto bg-white/10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible">
          {visibleAwards.map((award, index) => (
            <motion.article
              key={award.id ?? index}
              className="w-[88%] shrink-0 snap-start bg-zinc-900 p-4 sm:w-auto sm:p-6"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.24) }}
            >
              {award.image ? (
                <a href={award.image} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-white/10 bg-black/40">
                    <Image
                      src={award.image}
                      alt={`${award.title} certificate`}
                      fill
                      sizes="(max-width: 640px) 88vw, 45vw"
                      className="object-contain"
                    />
                  </div>
                </a>
              ) : null}

              <div className="mt-4 flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15">
                  <Trophy className="h-4 w-4 text-blue-300" aria-hidden="true" />
                </span>
                <div className="min-w-0 min-h-[5.5rem] sm:min-h-[6.25rem]">
                  <h3 className="text-base font-bold leading-snug text-white sm:text-lg">{award.title}</h3>
                  {award.issuer ? (
                    <p className="mt-0.5 text-sm font-medium text-blue-400">{award.issuer}</p>
                  ) : null}
                  {award.date ? (
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-emerald-400">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <time dateTime={String(award.date).slice(0, 10)}>{formatDate(award.date)}</time>
                    </p>
                  ) : null}
                </div>
              </div>

              {award.description ? (
                <div
                  className="mt-4 border-t border-white/10 pt-4 text-[13px] leading-[1.6] text-zinc-400 [text-wrap:pretty] [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-zinc-200"
                  dangerouslySetInnerHTML={{ __html: award.description }}
                />
              ) : null}
            </motion.article>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AwardsSection;