"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { education } from "@/data/education";

const EducationSection = ({ items }) => {
  const list = [...(items ?? education)].sort((a, b) => a.sortOrder - b.sortOrder);
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

  return (
    <motion.div
      className="py-12 text-white"
      initial={{ x: -100, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-6xl rounded-lg border border-white/10 bg-zinc-900/70 p-6 shadow-lg sm:p-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Learning path</p>
            <h2 className="mt-2 text-3xl font-bold tracking-normal">Education</h2>
            <p className="mt-3 max-w-2xl leading-7 text-zinc-400">Formal study and focused technical training that support my full-stack development work.</p>
          </div>
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button onClick={() => stepCard(-1)} aria-label="Previous" className="rounded-full border border-white/10 p-2 hover:bg-white/10 disabled:opacity-40" disabled={!canPrev}><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={() => stepCard(1)} aria-label="Next" className="rounded-full border border-white/10 p-2 hover:bg-white/10 disabled:opacity-40" disabled={!canNext}><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
        <div ref={trackRef} onScroll={updatePage} className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {list.map((edu) => (
            <article key={edu.id} className="w-full shrink-0 snap-start px-1 py-1 lg:w-1/2 lg:px-2">
              <div className="flex h-full flex-col rounded-xl border border-white/10 bg-black/20 p-5 transition hover:border-blue-400/30 hover:bg-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-blue-400/30 bg-blue-500/15">
                    <Image src={edu.logo} alt={`${edu.institute} logo`} width={48} height={48} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-blue-200">{edu.institute}</p>
                    <p className="text-xs text-zinc-500">{edu.district} · {edu.year}</p>
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-semibold leading-snug">{edu.degree}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{edu.description}</p>
                <span className="mt-4 w-fit rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">{edu.class}</span>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={`Go to page ${i + 1}`} className={`h-2 rounded-full transition-all ${i === page ? "w-7 bg-blue-400" : "w-2 bg-white/20 hover:bg-white/40"}`} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default EducationSection;
