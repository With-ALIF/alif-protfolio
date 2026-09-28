"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { aboutParagraphs } from "@/data/about";
import { siteProfile } from "@/data/site";

const About = ({ paragraphs, image }) => {
  const list = paragraphs?.length > 0 ? paragraphs : aboutParagraphs;
  const src = image || siteProfile.profileImage;

  return (
    <motion.div
      className="mx-auto max-w-5xl rounded-lg border border-white/10 bg-zinc-900/70 p-6 text-white sm:p-8"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
        <div className="hidden lg:block">
          <div className="overflow-hidden rounded-xl border border-white/10">
            <Image
              src={src}
              alt={`${siteProfile.name} portrait`}
              width={560}
              height={720}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">About Me</h2>
          </div>

          {list.map((paragraph, index) => (
            <p
              key={index}
              className="mt-4 text-justify leading-7 text-zinc-300 [&_strong]:text-white"
              dangerouslySetInnerHTML={{ __html: paragraph }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default About;
