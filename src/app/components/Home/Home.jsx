"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  Download,
  Github,
  Linkedin,
  Mail,
  Terminal,
  UserRound,
} from "lucide-react";
import { siteProfile } from "@/data/site";
import { heroFallback } from "@/data/hero";

export default function Home({ profile = siteProfile, hero = heroFallback }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-16 text-white">
      <section className="relative grid min-h-[calc(100vh-150px)] items-start gap-10 overflow-hidden lg:grid-cols-[1.1fr_0.9fr]">
        <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative space-y-8"
        >
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
              {profile.name}
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
              {hero.headline}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-zinc-300">
              {hero.value}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#projects"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-400"
            >
              View Projects <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Download Resume <Download className="h-4 w-4" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Contact Me <Mail className="h-4 w-4" />
            </a>
          </div>

          <div className="flex flex-nowrap gap-2 sm:gap-3">
            <a
              href={profile.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 px-2 py-2 text-xs text-zinc-300 hover:bg-white/10 hover:text-white sm:flex-none sm:gap-2 sm:px-4 sm:text-sm"
            >
              <Github className="h-4 w-4 shrink-0" />
              GitHub
            </a>
            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 px-2 py-2 text-xs text-zinc-300 hover:bg-white/10 hover:text-white sm:flex-none sm:gap-2 sm:px-4 sm:text-sm"
            >
              <Linkedin className="h-4 w-4 shrink-0" />
              LinkedIn
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 px-2 py-2 text-xs text-zinc-300 hover:bg-white/10 hover:text-white sm:flex-none sm:gap-2 sm:px-4 sm:text-sm"
            >
              <Mail className="h-4 w-4 shrink-0" />
              Email
            </a>
          </div>
        </motion.div>

        <motion.aside
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative rounded-lg border border-white/10 bg-zinc-950/70 p-4 shadow-2xl"
        >
          <div className="absolute right-4 top-4 z-10 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            Open to Remote Work
          </div>
          <div className="flex items-center justify-center pt-7">
      <div className="flex items-center justify-center">
  <div className="relative overflow-hidden rounded-lg w-[clamp(120px,12vw,170px)] h-[clamp(120px,12vw,170px)]">
    <Image
      src={profile.profileImage}
      alt={`${profile.name} portrait`}
      width={720}
      height={720}
      className="w-full h-full object-cover"
      priority
    />
  </div>
</div>
          </div>
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-sm uppercase text-zinc-400">{profile.role}</p>
              <h2 className="mt-1 text-xl font-semibold">{profile.name}</h2>
              <p className="mt-1 text-sm leading-6 text-zinc-300">
                Practical product developer focused on clean APIs, responsive UI,
                authentication, dashboards, and maintainable delivery.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <a href="#skills" className="rounded-lg border border-white/10 p-3 hover:bg-white/10">
                <Code2 className="mb-2 h-5 w-5 text-blue-300" />
                Tech arsenal
              </a>
              <a href="#about" className="rounded-lg border border-white/10 p-3 hover:bg-white/10">
                <UserRound className="mb-2 h-5 w-5 text-blue-300" />
                Quick bio
              </a>
              <a href="#services" className="rounded-lg border border-white/10 p-3 hover:bg-white/10">
                <BriefcaseBusiness className="mb-2 h-5 w-5 text-blue-300" />
                Services
              </a>
              <a href="#projects" className="rounded-lg border border-white/10 p-3 hover:bg-white/10">
                <Terminal className="mb-2 h-5 w-5 text-blue-300" />
                Case studies
              </a>
            </div>
          </div>
        </motion.aside>
      </section>
    </div>
  );
}
