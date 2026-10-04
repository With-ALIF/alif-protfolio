"use client";

import { motion } from "framer-motion";

const ExperienceSummary = ({ highlights }) => {
  const list = highlights ?? [];
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
          {list.map((item, index) => (
            <div
              key={index}
              className="border border-white/10 bg-zinc-900/70 p-4 sm:p-6 rounded-lg text-center shadow-lg"
            >
              <h3 className="text-2xl font-bold sm:text-3xl">{item.value}</h3>
              <p className="text-sm text-gray-400 sm:text-base">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ExperienceSummary;
