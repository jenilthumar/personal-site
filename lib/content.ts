import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Server-only content loader for the work collection. Reading `node:fs` keeps
 * this out of any client bundle. Each `content/<slug>.mdx` file carries YAML
 * frontmatter that drives the home grid, the sidebar index, and the project
 * detail page.
 */

export type WorkCategory = "project" | "photography";

/** A photograph with its natural aspect (e.g. "3/2", "2/3", "1/1") + caption. */
export type Photo = { src?: string; aspect?: string; caption?: string };
/** A photography block: one photo (full width) or a row of photos. */
export type PhotoBlock = Photo | Photo[];

export type WorkItem = {
  slug: string;
  title: string;
  category: WorkCategory;
  tags: string[];
  /** ISO date string (kept quoted in frontmatter so YAML doesn't coerce it). */
  date: string;
  cover?: string;
  summary?: string;
  /** Whether the .mdx has body content (the project case study) below frontmatter. */
  hasBody: boolean;

  // ── Project detail page ───────────────────────────────────────────────
  /** Full-bleed hero image. */
  hero?: string;
  /** Longer intro shown on the detail page (falls back to `summary`). */
  description?: string;
  sectors?: string;
  /** "What I did" — falls back to `tags`. */
  services?: string;
  timeline?: string;
  /** Falls back to `company`. */
  client?: string;
  company?: string;
  /** External live link (rendered as "Visit"). */
  url?: string;

  // ── Photography page ──────────────────────────────────────────────────
  /** Curated photo flow: a Photo (full width) or a Photo[] (a justified row). */
  photos?: PhotoBlock[];
};

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getAllWork(): WorkItem[] {
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".mdx"));

  const items = files.map((file): WorkItem => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { data, content } = matter(raw);

    return {
      slug,
      title: data.title ?? slug,
      category: (data.category ?? "project") as WorkCategory,
      tags: Array.isArray(data.tags) ? data.tags : [],
      date: data.date ? String(data.date) : "",
      cover: data.cover,
      summary: data.summary,
      hasBody: content.trim().length > 0,
      hero: data.hero,
      description: data.description,
      sectors: data.sectors,
      services: data.services,
      timeline: data.timeline,
      client: data.client,
      company: data.company,
      url: data.url,
      photos: Array.isArray(data.photos) ? data.photos : undefined,
    };
  });

  // Newest first — drives the grid and the sidebar index order.
  return items.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getWorkByCategory(category: WorkCategory): WorkItem[] {
  return getAllWork().filter((item) => item.category === category);
}

export function getWorkBySlug(slug: string): WorkItem | undefined {
  return getAllWork().find((item) => item.slug === slug);
}

/** The next entry in display order, wrapping around. Undefined if it's the only one. */
export function getNextWork(slug: string): WorkItem | undefined {
  const all = getAllWork();
  if (all.length <= 1) return undefined;
  const index = all.findIndex((item) => item.slug === slug);
  if (index === -1) return undefined;
  return all[(index + 1) % all.length];
}
