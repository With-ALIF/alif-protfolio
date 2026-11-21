import "./globals.css";
import SiteChrome from "./components/shared/SiteChrome";
import { getSiteSection } from "@/lib/cms";

const ICON_VERSION = 2;

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
  verification: {
    google: "j1fBRN3Flk5eKnQu8mRrJp8AmBoDyQsE5yXrA-Au3aU",
  },
  icons: {
    icon: [
      { url: `/favicon.ico?v=${ICON_VERSION}`, type: "image/x-icon", sizes: "16x16 32x32 48x48" },
      { url: `/favicon.svg?v=${ICON_VERSION}`, type: "image/svg+xml", sizes: "any" },
      { url: `/icon.png?v=${ICON_VERSION}`, type: "image/png", sizes: "512x512" },
    ],
    shortcut: [{ url: `/favicon.ico?v=${ICON_VERSION}`, type: "image/x-icon", sizes: "16x16 32x32 48x48" }],
    apple: [{ url: `/apple-icon.png?v=${ICON_VERSION}`, type: "image/png", sizes: "180x180" }],
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
