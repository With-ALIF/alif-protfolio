

import "./globals.css";
import SiteChrome from "./components/shared/SiteChrome";
import { getSiteSection } from "@/lib/cms";

export const metadata = {
  metadataBase: new URL("https://alif.mnr.bd"),
  title: {
    default: "Md Abdullah Al Khalid Alif | Full Stack Software Engineer",
    template: "%s | Md Abdullah Al Khalid Alif",
  },
  description:
    "Portfolio of Md Abdullah Al Khalid Alif, a Full Stack Software Engineer specializing in React, Next.js, Node.js, Express, MongoDB, PostgreSQL, Firebase, and modern web applications.",
  keywords: [
    "Md Abdullah Al Khalid Alif",
    "Full Stack Software Engineer",
    "MERN Developer",
    "Next.js Developer",
    "React Developer",
    "Node.js Developer",
    "Bangladesh Software Engineer",
  ],
  openGraph: {
    title: "Md Abdullah Al Khalid Alif | Full Stack Software Engineer",
    description:
      "Full Stack Software Engineer building responsive, accessible, and production-ready MERN and Next.js applications.",
    type: "website",
    url: "/",
    locale: "en_US",
    images: [
      {
        url: "/profile.jpg",
        width: 1024,
        height: 1024,
        alt: "Md Abdullah Al Khalid Alif",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Md Abdullah Al Khalid Alif | Full Stack Software Engineer",
    description:
      "Full Stack Software Engineer building responsive, accessible, and production-ready MERN and Next.js applications.",
  },
  manifest: "/site.webmanifest",
  icons: {
    // Declared explicitly instead of via app-directory file conventions
    // (src/app/icon.*), because defining `icons` at all makes Next drop the
    // file conventions from the head.
    //
    // Ordering matters. Google fetches /favicon.ico at the site root by
    // convention, so it is listed first and carries the full 16/32/48 size
    // set; browsers that prefer vector pick the SVG, and the 512 PNG is the
    // last-resort raster. Every entry renders the same artwork, so the
    // winner is cosmetic. `shortcut` re-declares the ICO under the legacy
    // rel name that older engines and some crawlers match on.
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32 48x48" },
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32 48x48" }],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
};

export default async function RootLayout({ children }) {
  const site = await getSiteSection();

  return (
    <html lang="en">
      <body data-theme="dark" className="min-h-screen bg-[#0f0f0f] text-white">
        <SiteChrome profile={site.profile} nav={site.nav}>{children}</SiteChrome>
      </body>
    </html>
  );
}
