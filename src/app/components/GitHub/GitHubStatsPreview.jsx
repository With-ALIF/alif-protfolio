"use client";

import { motion } from "framer-motion";
import StatCard from "./StatCard";
import { formatMonthYear } from "./utils";

export default function GitHubStatsPreview({ data }) {
  const stats = data?.ok ? data.stats : null;
  const memberSinceDate = stats?.memberSince ? new Date(stats.memberSince) : null;
  const memberSinceLabel =
    memberSinceDate && Number.isFinite(memberSinceDate.getTime())
      ? formatMonthYear(stats.memberSince, { month: "short" })
      : null;
  const memberSinceHint =
    memberSinceLabel !== null
      ? `GitHub member since ${formatMonthYear(stats.memberSince)}`
      : "GitHub membership date unavailable";

  return (
    <section className="space-y-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">GitHub at a glance</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
          A live snapshot of my public GitHub work — stars, contributions, active days, and account
          age, fetched directly from GitHub.
        </p>
      </motion.div>

      {stats ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            icon="stars"
            label="Total Stars"
            value={stats.totalStars}
            hint="Across public repositories"
            delay={0}
            variant="simple"
          />
          <StatCard
            icon="contributions"
            label="Total Contributions"
            value={stats.totalContributions}
            hint={
              stats.contributionLabel === "All time"
                ? "All time on GitHub"
                : stats.contributionLabel === "Last 6 months"
                  ? "Last 6 months"
                  : "Temporarily unavailable"
            }
            delay={0.05}
            variant="simple"
          />
          <StatCard
            icon="activeDays"
            label="Active Days"
            value={stats.activeDays}
            hint="Days with at least one contribution, all time"
            delay={0.1}
            variant="simple"
          />
          <StatCard
            icon="memberSince"
            label="Member Since"
            value={memberSinceLabel}
            hint={memberSinceHint}
            delay={0.15}
            variant="simple"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-zinc-900/60 px-5 py-6 text-center">
          <p className="text-sm font-medium text-zinc-200">
            GitHub statistics are temporarily unavailable.
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            The live numbers will return automatically after the next refresh.
          </p>
        </div>
      )}
    </section>
  );
}
