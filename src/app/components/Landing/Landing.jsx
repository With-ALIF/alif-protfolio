"use client";

import { motion } from "framer-motion";
import About from "@/component/About";
import EducationSection from "@/component/Education";
import ExperienceSummary from "@/component/ExperienceSummary";
import ExperienceSection from "@/component/Experince";
import Journey from "../Journey/Journey";
import AwardsSection from "@/component/Award";
import Home from "../Home/Home";
import Skills from "../Skills/Skills";
import Projects from "../Projects/Projects";
import Services from "../Services/Services";
import Contact from "../contact/Contact";

const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.6 },
};

const Reveal = ({ children, className = "" }) => (
  <motion.div {...reveal} className={className}>
    {children}
  </motion.div>
);

export default function Landing({ cms }) {
  const d = cms || {};

  return (
    <div className="space-y-20 text-white sm:space-y-28">
      <section id="home" className="scroll-mt-24 pt-10 sm:pt-14">
        <Home profile={d.site?.profile} hero={d.hero} />
      </section>

      <section id="about" className="scroll-mt-24">
        <div className="mx-auto max-w-screen-xl space-y-12 sm:space-y-16">
          <Reveal>
            <About paragraphs={d.about?.paragraphs} image={d.site?.profile?.profileImage} />
          </Reveal>
          <Reveal>
            <EducationSection items={d.education} />
          </Reveal>
        </div>
      </section>

      <section id="skills" className="scroll-mt-24">
        <Skills groups={d.skillGroups} tagIcons={d.tagIcons} />
      </section>

      <section id="experience" className="scroll-mt-24">
        <Reveal>
          <ExperienceSummary highlights={d.hero?.highlights} />
        </Reveal>
        <ExperienceSection items={d.experience} />
      </section>

      <section id="journey" className="scroll-mt-24">
        <Journey items={d.journey?.items} />
      </section>

      <section id="projects" className="scroll-mt-24">
        <Projects items={d.projects} tagIcons={d.tagIcons} studies={d.studies} />
      </section>

      <section id="services" className="scroll-mt-24">
        <Services items={d.services} />
      </section>

      <section id="achievements" className="scroll-mt-24">
        <AwardsSection items={d.awards} />
      </section>

      <section id="contact" className="scroll-mt-24 space-y-10">
        <Contact profile={d.site?.profile} />
      </section>
    </div>
  );
}
