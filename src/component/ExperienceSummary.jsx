"use client";

import { motion } from "framer-motion";
import CountUp from "./CountUp";

const ExperienceSummary = ({ highlights, githubStats }) => {
  const list = highlights ?? [];
  const githubProjectCount =
    githubStats?.ok && Number.isFinite(Number(githubStats?.stats?.publicRepositories))
      ? Number(githubStats.stats.publicRepositories)
      : null;

  if (list.length === 0) return null;

  return (
    <motion.div
      className="text-white py-12"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-6">Experience Summary</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {list.map((item, index) => {
            const isProjectsCompleted = /projects?\s*completed/i.test(item.label ?? "");
            const suffix = String(item.value ?? "").trim().endsWith("+") ? "+" : "";
            const value =
              isProjectsCompleted && githubProjectCount !== null
                ? `${githubProjectCount}${suffix}`
                : item.value;

            return (
              <div
                key={index}
                className="border border-white/10 bg-zinc-900/70 p-4 sm:p-6 rounded-lg text-center shadow-lg"
                title={
                  isProjectsCompleted && githubProjectCount !== null
                    ? "Live public repository count from GitHub"
                    : undefined
                }
              >
                <h3 className="text-2xl font-bold tabular-nums sm:text-3xl">
                  <CountUp value={value} />
                </h3>
                <p className="text-sm text-gray-400 sm:text-base">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default ExperienceSummary;
