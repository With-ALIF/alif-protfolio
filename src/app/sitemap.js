import { projects } from "@/data/projects";

const routes = ["", ...projects.map((project) => `/projects/${project.id}`)];

export default function sitemap() {
  const baseUrl = "https://alif.mnr.bd";

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
