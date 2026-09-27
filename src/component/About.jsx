"use client";

import { motion } from "framer-motion";
import { aboutParagraphs } from "@/data/about";

const About = ({ paragraphs }) => {
  const list = paragraphs?.length > 0 ? paragraphs : aboutParagraphs;

  return (
    <motion.div
      className="mx-auto max-w-4xl rounded-lg border border-white/10 bg-zinc-900/70 p-6 text-white sm:p-8"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">About Me</h2>
      </div>

      {list.map((paragraph, index) => (
        <p
          key={index}
          className="mt-4 leading-7 text-zinc-300 [&_strong]:text-white"
          dangerouslySetInnerHTML={{ __html: paragraph }}
        />
      ))}
    </motion.div>
  );
};

export default About;
