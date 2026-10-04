"use client";

import ProjectCard from "@/component/ProjectCart";
import { motion } from "framer-motion";

export default function Projects({ items, studies }) {
  const list = items ?? [];
  return (
    <section className="space-y-10 text-white">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h1 className="text-4xl font-bold tracking-normal text-blue-300 sm:text-5xl">Featured Projects</h1>
        <p className="mt-4 text-zinc-300">
          A focused look at full-stack products, the problems they solve, the stack behind them, and the role I played.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.1 },
          },
        }}
      >
        {list.map((project) => (
          <motion.div key={project.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <ProjectCard project={project} study={studies?.[project.id]} techStack={studies?.[project.id]?.technologies} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
