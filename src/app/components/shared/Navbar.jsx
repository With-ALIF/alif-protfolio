"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Menu, X } from "lucide-react";

const Navbar = ({ children, profile = {}, nav = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const scrollToSection = (target) => {
    const id = target.replace("#", "");
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
    } else {
      window.location.assign(`/#${id}`);
    }

    setIsOpen(false);
  };

  useEffect(() => {
    const ids = nav.map((item) => item.path.replace("#", ""));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (sections.length === 0) {
      setActiveSection("");
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((element) => observer.observe(element));

    const hash = window.location.hash.replace("#", "");
    if (hash && ids.includes(hash)) {
      setActiveSection(hash);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090b10]/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <button
            aria-label="Go to top of the page"
            className="group flex shrink-0 items-center gap-2 rounded-md px-0 py-0 text-left"
            onClick={() => scrollToSection("#home")}
          >
            <Image
              src="/alif-app-icon.svg"
              alt={`${profile.name} logo`}
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg"
              priority
            />
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-semibold tracking-wide">{profile.name}</span>
            </span>
          </button>

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-0.5 md:flex md:flex-wrap md:justify-end">
              {nav.map((item) => {
              const sectionId = item.path.replace("#", "");
              const isActive = activeSection === sectionId;

              return (
                <button
                  key={item.path}
                  onClick={() => scrollToSection(item.path)}
                  aria-current={isActive ? "true" : undefined}
                  className={`rounded-full px-2.5 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.title}
                </button>
              );
            })}
          </div>

          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400"
            >
              <Download className="h-4 w-4" />
              Resume
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-2 xl:hidden">
            <button
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-md border border-white/10 p-2 text-white hover:bg-white/10"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {isOpen && (
          <div className="mx-4 mb-4 space-y-3 rounded-lg border border-white/10 bg-zinc-950 p-4 xl:hidden">
              {nav.map((item) => {
              const sectionId = item.path.replace("#", "");
              const isActive = activeSection === sectionId;

              return (
                <button
                  key={item.path}
                  onClick={() => scrollToSection(item.path)}
                  aria-current={isActive ? "true" : undefined}
                  className={`block w-full rounded-md px-4 py-2 text-left transition ${
                    isActive ? "bg-white text-zinc-950" : "hover:bg-white/10"
                  }`}
                >
                  {item.title}
                </button>
              );
            })}
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-full bg-blue-500 px-4 py-2 text-center font-semibold hover:bg-blue-400"
            >
              Download Resume
            </a>
          </div>
        )}
      </header>

      <main className="mx-auto min-h-[400px] max-w-7xl px-4 py-3 sm:px-6">{children}</main>
    </div>
  );
};

export default Navbar;
