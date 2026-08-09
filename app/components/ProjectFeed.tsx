import Image from "next/image";
import Link from "next/link";
import type { FeedImage, FeedMedia, FeedProject } from "@/lib/content";
import { IMAGE_QUALITY, mediaUrl } from "@/lib/media";
import { FeedVideo } from "./FeedVideo";
import { ChevronMark } from "./PixelMarks";

/**
 * The home work feed: each project introduced by a header line, then its media
 * in authored order.
 *
 * Rows are justified rather than split evenly. Every cell gets `flex-basis: 0`
 * and a `flex-grow` equal to its aspect ratio, so widths come out proportional
 * to shape and the quotient — the height — lands identical across the row. A
 * 16:9 next to a 4:5 therefore reads as one band, which is what the design
 * does with the wide Opera render beside the phone shot. A block that isn't a
 * row is just a row of one, so it fills the column.
 */

/** Widest the media column gets: the 1920px frame less its 32px gutters. */
const COLUMN_PX = 1856;

function ratio(aspect: string): number {
  const [w, h] = aspect.split("/").map(Number);
  return w > 0 && h > 0 ? w / h : 16 / 9;
}

/** What each cell of a row asks the optimizer for, given its share of the row. */
function cellSizes(share: number): string {
  const wide = Math.round(COLUMN_PX * share);
  return `(min-width: 1920px) ${wide}px, ${Math.round(share * 100)}vw`;
}

function Cell({
  block,
  sizes,
  eager,
}: {
  block: FeedImage & { kind?: string; poster?: string };
  sizes: string;
  eager: boolean;
}) {
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
      className="relative w-full overflow-hidden bg-oxley-700/10"
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

/** One media block laid out as a justified row (a single block fills the width). */
function Row({ block, eager }: { block: FeedMedia; eager: boolean }) {
  const cells =
    block.kind === "row"
      ? block.images.map((image) => ({ ...image, kind: "image" as const }))
      : [block];

  const total = cells.reduce((sum, cell) => sum + ratio(cell.aspect), 0);

  return (
    <div className="flex gap-2">
      {cells.map((cell, index) => {
        const share = ratio(cell.aspect) / total;
        return (
          <div
            key={index}
            className="min-w-0"
            style={{ flex: `${ratio(cell.aspect)} 1 0` }}
          >
            <Cell block={cell} sizes={cellSizes(share)} eager={eager && index === 0} />
          </div>
        );
      })}
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
