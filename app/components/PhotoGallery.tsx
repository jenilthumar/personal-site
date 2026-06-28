"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { mediaUrl } from "@/lib/media";
import type { Photo, PhotoBlock, TextBlock } from "@/lib/content";

/** "3/2" → 1.5. Drives the contained box and the longest-side normalization. */
function ratioValue(aspect?: string): number {
  if (!aspect) return 3 / 2;
  const [w, h] = aspect.split("/").map((n) => Number(n.trim()));
  return w > 0 && h > 0 ? w / h : 3 / 2;
}

/** "3/2" → "3 / 2" for the CSS aspect-ratio property. */
function cssRatio(aspect?: string): string {
  return aspect ? aspect.replace("/", " / ") : "3 / 2";
}

type Cell = { photo: Photo; index: number };
type Segment =
  | { type: "text"; block: TextBlock }
  | { type: "photos"; cells: Cell[] }
  | { type: "feature"; cell: Cell };

/**
 * Walk the flow into render segments while assigning each photo a continuous
 * index. Text beats and feature frames both break the contact-sheet grid into
 * sections; `flat` is the photo-only sequence the lightbox steps through.
 */
function buildSegments(blocks: PhotoBlock[]): { segments: Segment[]; flat: Photo[] } {
  const segments: Segment[] = [];
  const flat: Photo[] = [];
  let run: Cell[] = [];
  const flush = () => {
    if (run.length) segments.push({ type: "photos", cells: run });
    run = [];
  };
  const push = (photo: Photo) => {
    run.push({ photo, index: flat.length });
    flat.push(photo);
  };

  for (const block of blocks) {
    if (Array.isArray(block)) block.forEach(push);
    else if ("text" in block) {
      flush();
      segments.push({ type: "text", block });
    } else if (block.feature) {
      flush();
      segments.push({ type: "feature", cell: { photo: block, index: flat.length } });
      flat.push(block);
    } else push(block);
  }
  flush();
  return { segments, flat };
}

function PhotoCell({
  photo,
  index,
  title,
  onOpen,
}: {
  photo: Photo;
  index: number;
  title: string;
  onOpen: (index: number) => void;
}) {
  const ratio = ratioValue(photo.aspect);
  // Every photo keeps its true ratio but is normalized to a shared visual
  // weight: its longest side fills the column. Landscapes go full column width
  // and short; portraits shrink to (ratio × column) so their height tops out at
  // the column width. Top-aligned, so rows keep a ragged contact-sheet edge.
  const widthPct = `${Math.min(1, ratio) * 100}%`;

  return (
    <li className="group flex flex-col gap-2">
      <span className="text-xs tracking-wide text-oxley-700 tabular-nums transition-colors group-hover:text-on-surface">
        {String(index + 1).padStart(2, "0")}
      </span>
      <button
        type="button"
        onClick={() => onOpen(index)}
        aria-label={photo.caption ?? `${title}, photo ${index + 1}`}
        className="relative block cursor-pointer overflow-hidden bg-oxley-700/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxley-300"
        style={{ width: widthPct, aspectRatio: cssRatio(photo.aspect) }}
      >
        {photo.src ? (
          <Image
            src={mediaUrl(photo.src)}
            alt={photo.caption ?? title}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <span className="block h-full w-full bg-linear-to-br from-oxley-700/25 via-oxley-700/10 to-transparent" />
        )}
      </button>
    </li>
  );
}

/** A narrative beat between image groups: a quiet, left-aligned prose block. */
function StoryText({ block }: { block: TextBlock }) {
  return (
    <div className="px-6">
      <div className="flex max-w-[640px] flex-col gap-4">
        {block.eyebrow ? (
          <p className="text-sm tracking-wide text-oxley-700 uppercase">
            {block.eyebrow}
          </p>
        ) : null}
        <p className="text-base leading-[1.3] text-on-surface">{block.text}</p>
      </div>
    </div>
  );
}

/** A chapter anchor: one photo shown large and centered, with its caption. */
function FeaturePhoto({
  cell: { photo, index },
  title,
  onOpen,
}: {
  cell: Cell;
  title: string;
  onOpen: (index: number) => void;
}) {
  return (
    <figure className="flex flex-col items-center gap-3 px-6">
      <button
        type="button"
        onClick={() => onOpen(index)}
        aria-label={photo.caption ?? `${title}, photo ${index + 1}`}
        className="max-w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxley-300"
      >
        {photo.src ? (
          <Image
            src={mediaUrl(photo.src)}
            alt={photo.caption ?? title}
            width={1600}
            height={Math.round(1600 / ratioValue(photo.aspect))}
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="h-auto max-h-[70vh] w-auto max-w-full object-contain"
          />
        ) : (
          <div className="aspect-[3/2] w-[70vw] bg-oxley-700/15" />
        )}
      </button>
      <figcaption className="flex max-w-[640px] flex-col items-center gap-1 text-center">
        <p className="text-xs tracking-wide text-oxley-700 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </p>
        {photo.caption ? (
          <p className="text-base leading-[1.3] text-on-surface">
            {photo.caption}
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}

/**
 * A contact-sheet index of the set: a tight, airy grid where every photo holds
 * its native aspect ratio (never cropped) and shares one visual weight, each
 * numbered above. Reads left-to-right, top-to-bottom, and absorbs any number of
 * mixed-ratio images. Clicking a frame opens a minimal full-screen lightbox
 * (Escape or the backdrop to close, arrow keys to move). Two columns on mobile.
 */
export function PhotoGallery({
  photos,
  title,
}: {
  photos?: PhotoBlock[];
  title: string;
}) {
  const { segments, flat } = buildSegments(photos ?? []);
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const close = () => setActive(null);
  const go = (dir: number) =>
    setActive((cur) =>
      cur === null ? cur : (cur + dir + flat.length) % flat.length,
    );

  useEffect(() => {
    if (active === null) return;
    dialogRef.current?.focus();
    const step = (dir: number) =>
      setActive((cur) =>
        cur === null ? cur : (cur + dir + flat.length) % flat.length,
      );
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active, flat.length]);

  if (!flat.length) return null;

  const current = active === null ? null : flat[active];

  return (
    <>
      <div className="flex flex-col gap-16 sm:gap-20">
        {segments.map((segment, i) =>
          segment.type === "text" ? (
            <StoryText key={i} block={segment.block} />
          ) : segment.type === "feature" ? (
            <FeaturePhoto
              key={i}
              cell={segment.cell}
              title={title}
              onOpen={setActive}
            />
          ) : (
            <ol
              key={i}
              role="list"
              className="grid grid-cols-2 items-start gap-x-5 gap-y-12 px-6 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5 lg:gap-y-16"
            >
              {segment.cells.map(({ photo, index }) => (
                <PhotoCell
                  key={index}
                  photo={photo}
                  index={index}
                  title={title}
                  onOpen={setActive}
                />
              ))}
            </ol>
          ),
        )}
      </div>

      {current && active !== null && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${title}, photo ${active + 1} of ${flat.length}`}
          tabIndex={-1}
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-surface/95 p-6 backdrop-blur-sm outline-none [animation:fade-in_150ms_ease-out]"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 text-oxley-300 transition-colors hover:text-on-surface"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-6"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {flat.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label="Previous photo"
                className="absolute top-1/2 left-2 -translate-y-1/2 p-2 text-oxley-300 transition-colors hover:text-on-surface sm:left-4"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="size-7"
                  aria-hidden="true"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label="Next photo"
                className="absolute top-1/2 right-2 -translate-y-1/2 p-2 text-oxley-300 transition-colors hover:text-on-surface sm:right-4"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="size-7"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </>
          )}

          <figure
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-full max-w-full flex-col items-center gap-3"
          >
            {current.src ? (
              <Image
                src={mediaUrl(current.src)}
                alt={current.caption ?? title}
                width={1600}
                height={Math.round(1600 / ratioValue(current.aspect))}
                sizes="92vw"
                className="h-auto max-h-[82vh] w-auto max-w-[92vw] object-contain [animation:fade-in_200ms_ease-out]"
              />
            ) : (
              <div className="aspect-[3/2] w-[60vw] bg-oxley-700/15" />
            )}
            <figcaption className="text-center text-sm text-oxley-700 tabular-nums">
              {active + 1} / {flat.length}
              {current.caption ? (
                <span className="text-on-surface"> · {current.caption}</span>
              ) : null}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
