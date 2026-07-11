"use client";

import type { RefObject } from "react";
import Image from "next/image";
import type { FeedImage, FeedMedia, FeedProject } from "@/lib/content";
import { IMAGE_QUALITY, mediaUrl } from "@/lib/media";
import { FeedVideo } from "./FeedVideo";

/**
 * The vertical-scroll home view: every project's media stacked in display
 * order with a uniform 8px gap. Landscape blocks run the full column width;
 * portrait pairs stay side by side. The project index and scroll tracking
 * live in HomeView's toolbar (via useFeedNav); this only renders the media and
 * hands each project's section element back through `sectionsRef` so the
 * toolbar can track and jump.
 */

// The main column is 100vw minus sidebar + gutters (480px) on desktop,
// capped by the 1920px shell; rows split that in two around an 8px gap.
const FULL_SIZES =
  "(min-width: 1920px) 1440px, (min-width: 1024px) calc(100vw - 480px), 100vw";
const HALF_SIZES =
  "(min-width: 1920px) 716px, (min-width: 1024px) calc(50vw - 244px), 50vw";

function ImageBlock({
  image,
  sizes,
  priority = false,
}: {
  image: FeedImage;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div
      className="relative w-full overflow-hidden bg-oxley-700/10"
      style={{ aspectRatio: image.aspect.replace("/", " / ") }}
    >
      <Image
        src={mediaUrl(image.src)}
        alt={image.alt}
        fill
        sizes={sizes}
        quality={IMAGE_QUALITY}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}

function MediaBlock({
  block,
  priority,
}: {
  block: FeedMedia;
  priority: boolean;
}) {
  if (block.kind === "row") {
    return (
      <div className="flex gap-2">
        {block.images.map((image, index) => (
          <div key={index} className="min-w-0 flex-1">
            <ImageBlock
              image={image}
              sizes={HALF_SIZES}
              priority={priority && index === 0}
            />
          </div>
        ))}
      </div>
    );
  }
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
  return <ImageBlock image={block} sizes={FULL_SIZES} priority={priority} />;
}

export function WorkFeed({
  projects,
  sectionsRef,
}: {
  projects: FeedProject[];
  /** One entry per project, filled with its <section> for tracking + jumps. */
  sectionsRef: RefObject<(HTMLElement | null)[]>;
}) {
  // The feed's LCP is the first image, which isn't necessarily the first block:
  // a project can lead with a video (a plain <video>, no next/image to flag), so
  // the first real image may be a later project's hero. Prioritize that one.
  const lcp = firstImageBlock(projects);

  return (
    <div className="flex flex-col gap-2">
      {projects.map((project, index) => (
        <section
          key={project.slug}
          ref={(el) => {
            sectionsRef.current[index] = el;
          }}
          aria-label={project.title}
          className="flex scroll-mt-16 flex-col gap-2"
        >
          {project.media.map((block, blockIndex) => (
            <MediaBlock
              key={blockIndex}
              block={block}
              priority={
                lcp !== null && lcp.project === index && lcp.block === blockIndex
              }
            />
          ))}
        </section>
      ))}
    </div>
  );
}

/** Coordinates of the first image-bearing block (image or row) in feed order,
 * skipping video blocks; null if the feed has no images at all. */
function firstImageBlock(
  projects: FeedProject[],
): { project: number; block: number } | null {
  for (let project = 0; project < projects.length; project++) {
    const media = projects[project].media;
    for (let block = 0; block < media.length; block++) {
      if (media[block].kind !== "video") return { project, block };
    }
  }
  return null;
}
