import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Server-only content loader for the work collection. Reading `node:fs` keeps
 * this out of any client bundle. Each `content/<slug>.mdx` file carries YAML
 * frontmatter that drives the home grid and the sidebar index; the MDX body is
 * rendered separately by the `/work/[slug]` route.
 */

export type WorkCategory = "project" | "photography";

export type WorkItem = {
  slug: string;
  title: string;
  category: WorkCategory;
  tags: string[];
  /** ISO date string (kept quoted in frontmatter so YAML doesn't coerce it). */
  date: string;
  cover?: string;
  company?: string;
  /** External live link, if any. */
  url?: string;
  summary?: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getAllWork(): WorkItem[] {
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".mdx"));

  const items = files.map((file): WorkItem => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { data } = matter(raw);

    return {
      slug,
      title: data.title ?? slug,
      category: (data.category ?? "project") as WorkCategory,
      tags: Array.isArray(data.tags) ? data.tags : [],
      date: data.date ? String(data.date) : "",
      cover: data.cover,
      company: data.company,
      url: data.url,
      summary: data.summary,
    };
  });

  // Newest first — drives both the grid and the sidebar index order.
  return items.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getWorkByCategory(category: WorkCategory): WorkItem[] {
  return getAllWork().filter((item) => item.category === category);
}

export function getWorkBySlug(slug: string): WorkItem | undefined {
  return getAllWork().find((item) => item.slug === slug);
}
