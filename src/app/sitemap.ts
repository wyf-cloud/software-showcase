import type { MetadataRoute } from "next";
import { readSoftware } from "@/lib/software-settings";

const baseUrl = "https://littleworks.example";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const software = await readSoftware();
  return [
    { url: baseUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/software`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/contact`, changeFrequency: "yearly", priority: 0.6 },
    ...software.map((item) => ({ url: `${baseUrl}/software/${item.slug}`, lastModified: new Date(item.updatedAt), changeFrequency: "monthly" as const, priority: item.featured ? 0.8 : 0.6 })),
  ];
}
