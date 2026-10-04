import { getCmsBundle } from "@/lib/cms";

export const revalidate = 3600;

export default async function sitemap() {
  const baseUrl = "https://alif.mnr.bd";
  const { projects } = await getCmsBundle();

  const routes = ["", ...projects.map((project) => `/projects/${project.id}`)];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}