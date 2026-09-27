

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
    images: [
      {
        url: "/profile.jpg",
        width: 1200,
        height: 630,
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
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
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
