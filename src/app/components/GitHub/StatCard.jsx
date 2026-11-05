"use client";

import { motion } from "framer-motion";
import {
  CalendarClock,
  CalendarDays,
  FolderGit2,
  GitCommitHorizontal,
  Star,
  Users,
} from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";
import { cardSurface } from "./utils";

const ICONS = {
  repositories: FolderGit2,
  stars: Star,
  followers: Users,
  contributions: GitCommitHorizontal,
  activeDays: CalendarDays,
  memberSince: CalendarClock,
};

export default function StatCard({ icon, label, value, hint, delay = 0, variant = "default" }) {
  const Icon = ICONS[icon] ?? FolderGit2;

  if (variant === "simple") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4, delay }}
        title={hint || undefined}
        className="rounded-lg border border-white/10 bg-zinc-900/70 p-4 text-center shadow-lg transition-colors hover:border-emerald-400/20 sm:p-6"
      >
        <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <AnimatedNumber
          value={value}
          className="mt-3 block text-2xl font-bold tabular-nums tracking-tight text-white sm:text-3xl"
        />
        <p className="mt-1 text-sm text-gray-400 sm:text-base">{label}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4, delay }}
      className={`group ${cardSurface} p-4 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-400/25 hover:bg-zinc-900/80 sm:p-5`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
          <AnimatedNumber
            value={value}
            className="mt-2 block text-3xl font-semibold tabular-nums tracking-tight text-white sm:text-[2rem]"
          />
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300 transition duration-200 group-hover:border-emerald-400/30 group-hover:bg-emerald-400/10">
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4 border-t border-white/[0.06] pt-3">
        <p className="truncate text-[11px] text-zinc-500">{hint}</p>
      </div>
    </motion.div>
  );
}
