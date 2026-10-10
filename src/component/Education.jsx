"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

const pad = (n) => String(n).padStart(2, "0");

const EducationSection = ({ items }) => {
  const list = [...(items ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const trackRef = useRef(null);
  const [page, setPage] = useState(0);
  const [perView, setPerView] = useState(1);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setPerView(mq.matches ? 2 : 1);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const pageCount = Math.max(1, Math.ceil(list.length / perView));

  const updatePage = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setPage(Math.min(pageCount - 1, Math.round(el.scrollLeft / el.clientWidth)));
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, [pageCount]);

  useEffect(() => {
    updatePage();
  }, [updatePage, perView]);

  const goTo = (p) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: Math.max(0, Math.min(pageCount - 1, p)) * el.clientWidth, behavior: "smooth" });
  };

  const stepCard = (dir) => {
    const el = trackRef.current;
    if (!el || list.length === 0) return;
    el.scrollTo({ left: el.scrollLeft + (dir * el.scrollWidth) / list.length, behavior: "smooth" });
  };

  // Counter and progress are based on cards, not pages, so the number always
  // matches how many entries exist (mobile 1-up shows 01 / 06).
  const seen = Math.min(page * perView + perView, list.length);
  const progress = list.length > 0 ? (seen / list.length) * 100 : 0;

  return (
    <motion.div
      className="py-12 text-white"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="mx-auto max-w-6xl rounded-lg border border-white/10 bg-zinc-900/70 p-5 shadow-lg sm:p-8">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300 sm:text-sm">
              Learning path
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-normal sm:text-4xl">Education</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
              My academic journey and technical foundation.
            </p>
          </div>
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button onClick={() => stepCard(-1)} aria-label="Previous" className="rounded-full border border-white/10 p-2 hover:bg-white/10 disabled:opacity-40" disabled={!canPrev}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => stepCard(1)} aria-label="Next" className="rounded-full border border-white/10 p-2 hover:bg-white/10 disabled:opacity-40" disabled={!canNext}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          onScroll={updatePage}
          className="mt-6 flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {list.map((edu, index) => (
            <article
              key={edu.id ?? index}
              className="w-full shrink-0 snap-start pr-4 last:pr-0 lg:w-1/2 lg:pr-4 lg:[&:nth-child(2n)]:pr-4"
            >
              <div className="flex h-full flex-col rounded-xl border border-white/10 bg-black/20 p-5">
                {/* Institution identity */}
                <div className="flex items-start gap-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/95 p-1">
                    {edu.logo ? (
                      <Image src={edu.logo} alt={`${edu.institute} logo`} width={48} height={48} className="h-full w-full object-contain" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold leading-snug text-blue-300 sm:text-lg">{edu.institute}</p>
                    {edu.district ? (
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-zinc-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {edu.district}
                      </p>
                    ) : null}
                    {edu.year ? (
                      <p className="mt-0.5 text-sm tabular-nums text-zinc-400">{edu.year}</p>
                    ) : null}
                  </div>
                </div>

                <hr className="my-4 border-white/10" />

                {/* Degree is the anchor of the card */}
                <h3 className="text-xl font-bold leading-snug tracking-tight sm:text-2xl">{edu.degree}</h3>
                {edu.description ? (
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{edu.description}</p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {edu.class ? (
                    <span className="rounded-full bg-blue-500/15 px-3 py-1.5 text-sm font-medium text-blue-200">
                      {edu.class}
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Progress */}
        <div className="mt-5 flex items-center justify-between text-sm text-zinc-400">
          <span>Academic Journey</span>
          <span className="tabular-nums">
            {pad(seen)} / {pad(list.length)}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={list.length}
          aria-valuenow={seen}
          aria-label="Education progress"
          className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10"
        >
          <div
            className="h-full rounded-full bg-blue-400 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default EducationSection;