import Image from "next/image";
import Link from "next/link";
import type { FeedImage, FeedMedia, FeedProject } from "@/lib/content";
import { IMAGE_QUALITY, mediaUrl } from "@/lib/media";
import { FeedVideo } from "./FeedVideo";
import { ChevronMark } from "./PixelMarks";

/**
 * The home work feed: each project introduced by a header line, then its media
 * in the rows the project declares (see FeedRowSpec in lib/content).
 *
 * Rows sit on a three-column grid so their edges line up down the page. The
 * design breaks Opera's first row at 914.67px, which is exactly where the
 * second row's third column starts, and that only holds on a real grid:
 * proportional widths drift, because a two-cell row clears one gap where a
 * three-cell row clears two. Grid does the gap arithmetic for us.
 *
 * The first cell carries the aspect ratio and so sets the row's height; the
 * rest fill it and crop, which is how the design fits a phone shot beside a
 * wide render. Reorder a row to change which image is the uncropped one.
 *
 * Below `md` the row stacks. Three columns of a 390px screen is 114px a cell,
 * which turns a UI screenshot into noise — even 640px only buys 197px, so the
 * grid starts at 768px where a cell clears 240px. Stacked cells also keep
 * their own aspect instead of cropping to a shared height, since there's no
 * row for them to line up with.
 */

// Tailwind needs these as literal strings to generate them, so they're mapped
// rather than interpolated. Spans only ever come out 1–3; a row wider than six
// columns isn't something the design does.
const GRID_COLUMNS: Record<number, string> = {
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
};
const COLUMN_SPAN: Record<number, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
};

/** Columns a row divides into. Gap is Tailwind's gap-2 (8px), as drawn. */
const COLUMNS = 3;

/** Widest the content column gets: the 1920px frame less its 32px gutters. */
const COLUMN_PX = 1856;

function ratio(aspect: string): number {
  const [w, h] = aspect.split("/").map(Number);
  return w > 0 && h > 0 ? w / h : 16 / 9;
}

type Cell = FeedImage & { kind?: string; poster?: string };

/**
 * Columns each cell takes. One cell fills the row; two split it 2/1 with the
 * wider image taking the pair, which is the design's landscape-beside-portrait
 * pairing; three or more take a column each.
 */
function columnSpans(cells: Cell[]): number[] {
  if (cells.length === 1) return [COLUMNS];
  if (cells.length === 2) {
    const [first, second] = cells;
    return ratio(first.aspect) >= ratio(second.aspect) ? [2, 1] : [1, 2];
  }
  return cells.map(() => 1);
}

/** What a cell asks the optimizer for, given its share of the content column. */
function cellSizes(share: number): string {
  const wide = Math.round(COLUMN_PX * share);
  const part = Math.round(share * 100);
  // Full width once the row stacks.
  return `(min-width: 1920px) ${wide}px, (min-width: 768px) ${part}vw, 100vw`;
}

function Cell({
  block,
  lead,
  sizes,
  eager,
}: {
  block: Cell;
  /** First cell of the row: its aspect ratio is what gives the row its height. */
  lead: boolean;
  sizes: string;
  eager: boolean;
}) {
  // Only a video that owns its whole row reaches here, so it's always the lead
  // and keeps its own aspect box.
  if (block.kind === "video") {
    return (
      <FeedVideo
        src={block.src}
        poster={block.poster}
        aspect={block.aspect}
        alt={block.alt}
      />
    );
  }

  return (
    <div
      // Stacked, every cell keeps its own aspect box. In a row, the cells after
      // the first go absolute so the lead's height is the one that counts —
      // which also makes their aspect-ratio inert, both dimensions being fixed.
      className={
        lead
          ? "relative w-full overflow-hidden bg-oxley-700/10"
          : "relative w-full overflow-hidden bg-oxley-700/10 md:absolute md:inset-0"
      }
      style={{ aspectRatio: block.aspect.replace("/", " / ") }}
    >
      <Image
        src={mediaUrl(block.src)}
        alt={block.alt}
        fill
        sizes={sizes}
        quality={IMAGE_QUALITY}
        // The feed's first image is the one worth racing; `priority` is
        // deprecated in Next 16, and it's only part-way above the fold here,
        // so it gets an eager high-priority fetch rather than a head preload.
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        className="object-cover"
      />
    </div>
  );
}

function Row({ block, eager }: { block: FeedMedia; eager: boolean }) {
  const cells: Cell[] =
    block.kind === "row"
      ? block.images.map((image) => ({ ...image, kind: "image" }))
      : [block];

  const spans = columnSpans(cells);
  const columns = spans.reduce((total, span) => total + span, 0);

  return (
    <div className={`grid grid-cols-1 gap-2 ${GRID_COLUMNS[columns] ?? "md:grid-cols-3"}`}>
      {cells.map((cell, index) => (
        <div
          key={index}
          className={`relative min-w-0 ${COLUMN_SPAN[spans[index]] ?? ""}`}
        >
          <Cell
            block={cell}
            lead={index === 0}
            sizes={cellSizes(spans[index] / columns)}
            eager={eager && index === 0}
          />
        </div>
      ))}
    </div>
  );
}

function ProjectSection({
  project,
  eager,
}: {
  project: FeedProject;
  eager: boolean;
}) {
  return (
    <section aria-labelledby={`${project.slug}-title`} className="flex flex-col gap-6">
      <Link
        href={project.href}
        className="group flex items-center justify-between gap-6 text-[18px] leading-[1.2] tracking-[-0.16px]"
      >
        <h2 id={`${project.slug}-title`} className="flex min-w-0 items-center gap-4">
          <span className="truncate font-medium text-on-surface">{project.title}</span>
          {project.services && (
            <span
              className="hidden shrink-0 text-oxley-700 transition-colors group-hover:text-on-surface sm:inline"
              style={{ fontFeatureSettings: '"case" 1' }}
            >
              [ {project.services} ]
            </span>
          )}
        </h2>

        <span className="flex shrink-0 items-center gap-1 text-on-surface transition-colors group-hover:text-oxley-300">
          View project
          <ChevronMark />
        </span>
      </Link>

      <div className="flex flex-col gap-2">
        {project.media.map((block, index) => (
          <Row key={index} block={block} eager={eager && index === 0} />
        ))}
      </div>
    </section>
  );
}

export function ProjectFeed({ projects }: { projects: FeedProject[] }) {
  // The eager fetch goes to the first project that actually leads with an
  // image — a project opening on a video has no next/image to flag.
  const lead = projects.findIndex((project) => project.media[0]?.kind !== "video");

  return (
    <div className="flex flex-col gap-14 lg:gap-24">
      {projects.map((project, index) => (
        <ProjectSection key={project.slug} project={project} eager={index === lead} />
      ))}
    </div>
  );
}
