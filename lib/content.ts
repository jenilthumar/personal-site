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

/**
 * A photograph with its natural aspect (e.g. "3/2", "2/3", "1/1") + caption.
 * `feature` lifts it out of the contact-sheet grid: shown large and centered,
 * with its caption, as a chapter anchor.
 */
export type Photo = {
  src?: string;
  aspect?: string;
  caption?: string;
  feature?: boolean;
};
/** A prose beat dropped into the photo flow, to tell the story between images. */
export type TextBlock = { text: string; eyebrow?: string };
/** An item in a photo flow: one photo, a row of photos, or a text beat. */
export type PhotoBlock = Photo | Photo[] | TextBlock;

/** True when a flow item is a prose beat rather than a photo (or row). */
export function isTextBlock(block: PhotoBlock): block is TextBlock {
  return !Array.isArray(block) && "text" in block;
}

/** Count of photographs in a flow, ignoring text beats. */
export function countPhotos(blocks: PhotoBlock[] = []): number {
  return blocks.reduce(
    (n, b) => n + (Array.isArray(b) ? b.length : isTextBlock(b) ? 0 : 1),
    0,
  );
}

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
  /** Optional looping video hero (muted, autoplay); uses `hero` as its poster. */
  heroVideo?: string;
  /** Longer intro shown on the detail page (falls back to `summary`). */
  description?: string;
  sectors?: string;
  /** "What I did" — falls back to `tags`. */
  services?: string;
  timeline?: string;
  /** Falls back to `company`. */
  client?: string;
  company?: string;
  /** External link. Projects render it as "Visit"; photography treats a YouTube
   * link as the item's film (shown by FilmSpotlight). */
  url?: string;

  // ── Photography page ──────────────────────────────────────────────────
  /** One-line note shown under the film, when `url` is a YouTube link. */
  filmNote?: string;
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
      heroVideo: data.heroVideo,
      description: data.description,
      sectors: data.sectors,
      services: data.services,
      timeline: data.timeline,
      client: data.client,
      company: data.company,
      url: data.url,
      filmNote: data.filmNote,
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

/** Detail-page path for a work item. Photography lives under /photography. */
export function workHref(item: Pick<WorkItem, "slug" | "category">): string {
  return item.category === "photography"
    ? `/photography/${item.slug}`
    : `/work/${item.slug}`;
}

// ── Home feed ────────────────────────────────────────────────────────────
// The vertical-scroll home view: every project's media, in display order.

export type FeedImage = { src: string; alt: string; aspect: string };

/** One block in the feed: a full-width image or video, or a side-by-side row. */
export type FeedMedia =
  | ({ kind: "image" } & FeedImage)
  | ({ kind: "video"; poster?: string } & FeedImage)
  | { kind: "row"; images: FeedImage[] };

export type FeedProject = {
  slug: string;
  title: string;
  tags: string[];
  href: string;
  media: FeedMedia[];
};

/** `key="value"` attribute pairs of a JSX-ish tag string. */
function tagAttrs(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const [, key, value] of tag.matchAll(/(\w+)="([^"]*)"/g)) {
    attrs[key] = value;
  }
  return attrs;
}

/**
 * Media blocks of a case-study body, in authored order. Bodies use a fixed
 * set of media tags (<Video>, <Full>, <Row> of <Img>), so a light scan
 * recovers them without compiling the MDX.
 */
function parseBodyMedia(body: string): FeedMedia[] {
  const media: FeedMedia[] = [];
  const blocks = body.matchAll(
    /<(?:Full|Video)\b[^>]*\/>|<Row\b[\s\S]*?<\/Row>/g,
  );

  for (const [block] of blocks) {
    if (block.startsWith("<Row")) {
      const images = [...block.matchAll(/<Img\b[^>]*\/>/g)].flatMap(([img]) => {
        const attrs = tagAttrs(img);
        return attrs.src
          ? [{ src: attrs.src, alt: attrs.alt ?? "", aspect: attrs.aspect ?? "3/2" }]
          : [];
      });
      if (images.length) media.push({ kind: "row", images });
    } else {
      const attrs = tagAttrs(block);
      if (!attrs.src) continue;
      const base = {
        src: attrs.src,
        alt: attrs.alt ?? "",
        aspect: attrs.aspect ?? "16/9",
      };
      media.push(
        block.startsWith("<Video")
          ? { kind: "video", poster: attrs.poster, ...base }
          : { kind: "image", ...base },
      );
    }
  }

  return media;
}

/**
 * Projects for the home feed, newest first: each leads with its hero (the
 * loop video when there is one), then the case-study media as authored.
 * Photography stays out; a project with no media at all is skipped.
 */
export function getWorkFeed(): FeedProject[] {
  return getWorkByCategory("project")
    .map((item): FeedProject => {
      const raw = fs.readFileSync(
        path.join(CONTENT_DIR, `${item.slug}.mdx`),
        "utf8",
      );
      const { content } = matter(raw);

      const media: FeedMedia[] = [];
      const heroImage = item.hero ?? item.cover;
      if (item.heroVideo) {
        media.push({
          kind: "video",
          src: item.heroVideo,
          poster: heroImage,
          alt: item.title,
          aspect: "16/9",
        });
      } else if (heroImage) {
        media.push({ kind: "image", src: heroImage, alt: item.title, aspect: "16/9" });
      }

      for (const block of parseBodyMedia(content)) {
        // The hero often doubles as a body image — don't show it twice.
        if (block.kind === "image" && block.src === heroImage) continue;
        media.push(block);
      }

      return {
        slug: item.slug,
        title: item.title,
        tags: item.tags,
        href: workHref(item),
        media,
      };
    })
    .filter((project) => project.media.length > 0);
}

/** The next entry in display order, wrapping around. Undefined if it's the only one. */
export function getNextWork(slug: string): WorkItem | undefined {
  const all = getAllWork();
  if (all.length <= 1) return undefined;
  const index = all.findIndex((item) => item.slug === slug);
  if (index === -1) return undefined;
  return all[(index + 1) % all.length];
}
