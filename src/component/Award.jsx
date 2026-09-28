"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { awards as localAwards } from "@/data/awards";

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const AwardsSection = ({ items }) => {
  const scrollerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const getStep = () => {
    const card = scrollerRef.current?.querySelector("[data-award-card]");
    return card ? card.getBoundingClientRect().width + 24 : 0;
  };

  const handleScroll = () => {
    const step = getStep();
    if (!step) return;
    setActiveIndex(Math.round(scrollerRef.current.scrollLeft / step));
  };

  const goTo = (index) => {
    const step = getStep();
    if (!step || !scrollerRef.current) return;
    scrollerRef.current.scrollTo({ left: index * step, behavior: "smooth" });
    setActiveIndex(index);
  };

  const visibleAwards = (items ?? localAwards)
    .filter((award) => award.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <motion.div
      className="text-white pb-10 mb-12 py-12"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="max-w-4xl mx-auto border border-white/10 bg-zinc-900/70 p-6 rounded-lg shadow-lg">
        <h2 className="text-4xl font-bold tracking-normal mb-6 text-center sm:text-5xl">Awards</h2>

        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {visibleAwards.map((award, index) => (
            <motion.div
              key={award.id}
              data-award-card
              className="w-[85%] shrink-0 snap-start border border-white/10 bg-black/20 p-6 rounded-lg shadow-lg md:w-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <a
                href={award.image}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded border border-white/10 bg-black/40">
                  <Image
                    src={award.image}
                    alt={`${award.title} certificate`}
                    fill
                    sizes="(max-width: 768px) 85vw, 400px"
                    className="object-contain"
                  />
                </div>
              </a>

              <h3 className="mt-4 text-xl font-bold">{award.title}</h3>
              <p className="text-sm text-blue-400">By {award.issuer}</p>
              <p className="text-gray-400 text-sm mb-3">
                {formatDate(award.date)}
              </p>
              <div
                className="text-gray-300 text-sm [&_p]:mb-2"
                dangerouslySetInnerHTML={{ __html: award.description }}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-5 flex justify-center gap-2 md:hidden">
          {visibleAwards.map((award, index) => (
            <button
              key={award.id}
              type="button"
              aria-label={`Go to award ${index + 1}`}
              onClick={() => goTo(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                index === activeIndex ? "bg-blue-400" : "bg-white/25"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AwardsSection;
