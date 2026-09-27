"use client";

import { motion } from "framer-motion";
import { Brush, Code, Monitor, Wrench } from "lucide-react";
import { servicesData as localServices } from "@/data/services";

const SERVICE_ICONS = {
  code: Code,
  monitor: Monitor,
  brush: Brush,
  wrench: Wrench,
};

export default function Services({ items }) {
  const visibleServices = [...(items ?? localServices)].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <section className="space-y-10 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase text-blue-300">Services</p>
        <h1 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">How I can help</h1>
        <p className="mt-4 text-zinc-300">
          Practical development services for job-ready products, MVPs, portfolio-grade applications, and client websites.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.45 }}
        className="grid gap-5 sm:grid-cols-2"
      >
        {visibleServices.map((service) => {
          const Icon = SERVICE_ICONS[String(service.icon).toLowerCase()] || Code;
          return (
            <article key={service.id} className="rounded-lg border border-white/10 bg-zinc-900/70 p-6 transition hover:-translate-y-1 hover:border-blue-400/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/15 text-blue-200">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-xl font-semibold">{service.title}</h2>
              <p className="mt-3 leading-7 text-zinc-300">{service.desc}</p>
            </article>
          );
        })}
      </motion.div>
    </section>
  );
}
