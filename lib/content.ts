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
 * Which layout a case study's detail page uses.
 *
 * `showcase` is the original: a full-bleed hero, then media at window width
 * with prose between it. It's the right frame for work whose argument *is* the
 * artefact — a website, an identity, a set of screens.
 *
 * `study` is for product work, where the argument is the reasoning and the
 * screens are evidence for it. Same hero, then a rail of sections beside a
 * reading column, with media sized to that column rather than the window. See
 * StudyView.
 *
 * Declared per project as `format: study` in frontmatter; anything else, or
 * nothing at all, stays on the showcase.
 */
export type WorkFormat = "showcase" | "study";

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

/**
 * One row of the home feed, declared per project as `feed:` in frontmatter.
 *
 * The home page shows a curated cut of a project, not the whole case study, so
 * the rows are stated rather than derived. An entry names media the project
 * already has — by file stem ("01-hero-thumbnail") or full path — and inherits
 * its aspect and alt from the case study, so nothing is written twice. The
 * object form covers anything the case study doesn't hold.
 *
 *   feed:
 *     - [01-hero-thumbnail, 02-home-screen-mobile]
 *     - [05-mobile, 06-mobile, 03-metadata]
 */
export type FeedEntry = string | { src: string; aspect?: string; alt?: string };
export type FeedRowSpec = FeedEntry[];

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
  /** Which detail-page layout this one uses. Defaults to "showcase". */
  format: WorkFormat;

  // ── Project detail page ───────────────────────────────────────────────
  /** Full-bleed hero image. */
  hero?: string;
  /** Optional looping video hero (muted, autoplay); uses `hero` as its poster. */
  heroVideo?: string;
  /**
   * Which ink the masthead takes when it stands on this project's hero, and
   * the switch that puts it there at all. `light` for a dark cover, `dark` for
   * a light one; omitted, the nav sits on the page surface above the frame
   * instead, in the site's own tokens.
   *
   * It's declared rather than derived because there is no honest way to derive
   * it. A blend was the first answer — white in `mix-blend-difference`, the way
   * the wordmark used to do it — and it works on three of the four covers here
   * and fails on the fourth: `difference` inverts, so a backdrop near mid grey
   * comes back as another mid grey, and Stoa's sunset landed the bar at 2.4:1.
   * Darkening the backdrop doesn't help, because it drags the inverted type
   * down with it. Sampling the image at build time would only move the guess
   * earlier, and it can't see a video at all.
   *
   * So the person who chose the cover says which way it reads. Two things to
   * check when setting it: the strip the bar actually occupies, which is the
   * top ~60px and not the picture as a whole, and — for a `heroVideo` — the
   * whole loop, since a frame that turns pale halfway through is the one that
   * loses the nav.
   */
  heroInk?: "light" | "dark";
  /** Longer intro shown on the detail page (falls back to `summary`). */
  description?: string;
  sectors?: string;
  /** "What I did" — falls back to `tags`. */
  services?: string;
  timeline?: string;
  /** Falls back to `company`. */
  client?: string;
  company?: string;
  /** The hat worn on this one, e.g. "Founder & Product Designer". Leads the
   * detail grid: on a portfolio the reader is sizing up the person, not the
   * client. */
  role?: string;
  /** Who else was on it, e.g. "Solo designer, 3 engineers". */
  team?: string;
  /** One line on what changed because the work shipped. Printed under the
   * title on the home grid, so a result reads before the click. */
  outcome?: string;
  /** External link. Projects render it as "Visit"; photography treats a YouTube
   * link as the item's film (shown by FilmSpotlight). */
  url?: string;

  /** Curated home-feed rows; see FeedRowSpec. Absent means "replay the body". */
  feed?: FeedRowSpec[];

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
      format: data.format === "study" ? "study" : "showcase",
      hero: data.hero,
      heroVideo: data.heroVideo,
      heroInk:
        data.heroInk === "light" || data.heroInk === "dark"
          ? data.heroInk
          : undefined,
      description: data.description,
      sectors: data.sectors,
      services: data.services,
      timeline: data.timeline,
      client: data.client,
      company: data.company,
      role: data.role,
      team: data.team,
      outcome: data.outcome,
      url: data.url,
      feed: Array.isArray(data.feed)
        ? data.feed.map((row: FeedEntry | FeedEntry[]) =>
            Array.isArray(row) ? row : [row],
          )
        : undefined,
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

// ── Study sections ───────────────────────────────────────────────────────
// The rail down the left of a `study` case study, and the anchors it points at.

/** One entry in a study's rail: a `##` heading of its body, in reading order. */
export type StudySection = { id: string; label: string };

/**
 * URL fragment for a section label. Exported so the rail and the body's own h2
 * mapping share one slugifier — two of them is two chances to disagree, and
 * the disagreement shows up as a rail whose links go nowhere.
 */
export function sectionId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The `##` headings of a case-study body, in order.
 *
 * Read out of the body rather than declared in frontmatter, and that is the
 * point. The reference this format is drawn from keeps its rail in a list of
 * its own, and the labels have already drifted from the headings they point
 * at — the rail says "Overview" over a section headed "Problem". A rail that
 * can only ever say what the page says cannot do that.
 *
 * Fenced code is stripped first. Nothing in the collection opens a code block
 * today, but the rail shouldn't be one code sample away from listing a comment
 * as a section.
 */
export function getStudySections(slug: string): StudySection[] {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, `${slug}.mdx`), "utf8");
  const { content } = matter(raw);
  const prose = content.replace(/^```[\s\S]*?^```/gm, "");

  // `##` and not `###`: the third hash isn't a space, so it never matches.
  return [...prose.matchAll(/^##[ \t]+(.+?)[ \t]*$/gm)].map(([, label]) => ({
    id: sectionId(label),
    label,
  }));
}

// ── Home feed ────────────────────────────────────────────────────────────
// The vertical-scroll home view: every project's media, in display order.

export type FeedImage = {
  src: string;
  alt: string;
  aspect: string;
  /** This cell is also the case study's hero, so the two can be paired across
   *  the navigation. Set on at most one cell per project. */
  hero?: boolean;
};

/** A single cell: one image or one video, never a row of them. */
export type FeedCell =
  | ({ kind: "image" } & FeedImage)
  | ({ kind: "video"; poster?: string } & FeedImage);

/** One block in the feed: a full-width image or video, or a side-by-side row. */
export type FeedMedia = FeedCell | { kind: "row"; images: FeedImage[] };

export type FeedProject = {
  slug: string;
  title: string;
  tags: string[];
  /** The bracketed discipline in the feed header, e.g. "[ Product Design ]". */
  services?: string;
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
 * set of media tags (<Video>, <Full>, <Figure>, <Row> of <Img>), so a light
 * scan recovers them without compiling the MDX.
 *
 * <Figure> is the study format's image and belongs here for the same reason
 * the others do: a project's feed row names media by file stem, and an image
 * the scan can't see is an image `feed:` can't name. It defaults to the same
 * 16/9 as <Full>, so the two agree about an unstated aspect.
 */
function parseBodyMedia(body: string): FeedMedia[] {
  const media: FeedMedia[] = [];
  const blocks = body.matchAll(
    /<(?:Full|Video|Figure)\b[^>]*\/>|<Row\b[\s\S]*?<\/Row>/g,
  );

  for (const [block] of blocks) {
    if (block.startsWith("<Row")) {
      const images = [...block.matchAll(/<Img\b[^>]*\/>/g)].flatMap(([img]) => {
        const attrs = tagAttrs(img);
        return attrs.src
          ? [
              {
                src: attrs.src,
                alt: attrs.alt ?? "",
                aspect: attrs.aspect ?? "3/2",
              },
            ]
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

/** A media path reduced to its file stem: "work/x/01-hero.webp?v=2" → "01-hero". */
function stem(src: string): string {
  const file = src.split("?")[0].split("/").pop() ?? src;
  return file.replace(/\.[a-z0-9]+$/i, "");
}

type KnownMedia = FeedImage & { kind: "image" | "video"; poster?: string };

/**
 * Everything a project could put in its feed — hero, hero video, and every
 * body block — keyed by both full path and file stem so `feed:` can name an
 * image the short way. First writer wins, so the hero's 16:9 isn't displaced
 * by a body copy of the same file.
 */
function knownMedia(
  item: WorkItem,
  body: FeedMedia[],
): Map<string, KnownMedia> {
  const index = new Map<string, KnownMedia>();
  const add = (entry: KnownMedia) => {
    for (const key of [entry.src, stem(entry.src)]) {
      if (!index.has(key)) index.set(key, entry);
    }
  };

  const heroImage = item.hero ?? item.cover;
  if (heroImage) {
    add({ src: heroImage, alt: item.title, aspect: "16/9", kind: "image" });
  }
  if (item.heroVideo) {
    add({
      src: item.heroVideo,
      alt: item.title,
      aspect: "16/9",
      kind: "video",
      poster: heroImage,
    });
  }

  for (const block of body) {
    if (block.kind === "row") {
      for (const image of block.images) add({ ...image, kind: "image" });
    } else {
      add(block);
    }
  }

  return index;
}

/**
 * A declared row turned into feed media. Entries that name nothing the project
 * has, and carry no aspect of their own, are dropped rather than guessed at. A
 * row of one is emitted as a plain block so it fills the column.
 */
function resolveRow(
  row: FeedRowSpec,
  index: Map<string, KnownMedia>,
): FeedMedia | null {
  const cells = row.flatMap((entry): KnownMedia[] => {
    const spec = typeof entry === "string" ? { src: entry } : entry;
    const known = index.get(spec.src) ?? index.get(stem(spec.src));
    if (!known && !spec.aspect) return [];
    return [
      {
        src: known?.src ?? spec.src,
        alt: spec.alt ?? known?.alt ?? "",
        aspect: spec.aspect ?? known?.aspect ?? "16/9",
        kind: known?.kind ?? "image",
        poster: known?.poster,
      },
    ];
  });

  if (!cells.length) return null;

  if (cells.length === 1) {
    const [only] = cells;
    return only.kind === "video"
      ? {
          kind: "video",
          src: only.src,
          poster: only.poster,
          alt: only.alt,
          aspect: only.aspect,
        }
      : { kind: "image", src: only.src, alt: only.alt, aspect: only.aspect };
  }

  // Side-by-side cells are stills; a video sharing a row shows its poster.
  return {
    kind: "row",
    images: cells.map(({ src, alt, aspect, kind, poster }) => ({
      src: kind === "video" ? (poster ?? src) : src,
      alt,
      aspect,
    })),
  };
}

/**
 * Mark the one feed cell that is also the case study's hero, so the two ends of
 * the navigation can be paired. First match wins: two elements sharing a
 * view-transition-name aborts the transition outright, and nothing stops a
 * project from naming the same file in two rows.
 */
function markHeroCell(media: FeedMedia[], heroSrc?: string) {
  if (!heroSrc) return;
  const target = stem(heroSrc);

  for (const block of media) {
    if (block.kind === "row") {
      const match = block.images.find((image) => stem(image.src) === target);
      if (match) {
        match.hero = true;
        return;
      }
    } else if (block.kind === "image" && stem(block.src) === target) {
      block.hero = true;
      return;
    }
  }
}

/**
 * Projects for the home feed, newest first.
 *
 * A project with a `feed:` block shows exactly the rows it declares. Without
 * one it falls back to replaying the case study: the hero first (the loop
 * video when there is one), then the body media as authored. Photography stays
 * out; a project with no media at all is skipped.
 */
export function getWorkFeed(): FeedProject[] {
  return getWorkByCategory("project")
    .map((item): FeedProject => {
      const raw = fs.readFileSync(
        path.join(CONTENT_DIR, `${item.slug}.mdx`),
        "utf8",
      );
      const { content } = matter(raw);
      const body = parseBodyMedia(content);

      let media: FeedMedia[];
      if (item.feed?.length) {
        const index = knownMedia(item, body);
        media = item.feed
          .map((row) => resolveRow(row, index))
          .filter((block): block is FeedMedia => block !== null);
      } else {
        media = [];
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
          media.push({
            kind: "image",
            src: heroImage,
            alt: item.title,
            aspect: "16/9",
          });
        }

        for (const block of body) {
          // The hero often doubles as a body image — don't show it twice.
          if (block.kind === "image" && block.src === heroImage) continue;
          media.push(block);
        }
      }

      // A looping hero video has no still to morph into, so those projects
      // sit the pairing out.
      if (!item.heroVideo) markHeroCell(media, item.hero ?? item.cover);

      return {
        slug: item.slug,
        title: item.title,
        tags: item.tags,
        services: item.services ?? item.tags[0],
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
