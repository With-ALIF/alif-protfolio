"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";

export default function SiteChrome({ profile, nav, children }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return <div className="min-h-screen text-white">{children}</div>;
  }
  return (
    <>
      <Navbar profile={profile} nav={nav}>{children}</Navbar>
      <Footer profile={profile} />
      <ScrollToTop />
    </>
  );
}
