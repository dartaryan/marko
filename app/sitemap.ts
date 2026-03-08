import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

const LAST_UPDATED = new Date("2026-03-08");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_UPDATED,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/sign-in`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/sign-up`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
