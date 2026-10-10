export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    // Absolute URL: the robots.txt spec requires a full URL here, and Google
    // ignores a relative path.
    sitemap: "https://alif.mnr.bd/sitemap.xml",
  };
}