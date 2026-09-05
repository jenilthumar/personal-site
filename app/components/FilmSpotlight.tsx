"use client";

import { useState } from "react";
import Image from "next/image";
import { IMAGE_QUALITY } from "@/lib/media";

/** Pull the 11-char video id out of a youtu.be / youtube.com link. */
function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  return m ? m[1] : null;
}

/**
 * A photography item's film, given top billing: the video's own title-card
 * thumbnail as a poster with a play button. Clicking swaps in the embedded
 * player, so YouTube's scripts only load if someone actually presses play.
 * Renders nothing if the url isn't a recognizable YouTube link.
 *
 * The poster stays mounted underneath for the whole handoff. An embed renders
 * black until YouTube boots, which is half a second of nothing where the film
 * used to be; holding the title card and fading the player in over it means the
 * frame never empties.
 */
export function FilmSpotlight({
  url,
  note,
  title,
}: {
  url: string;
  note?: string;
  title: string;
}) {
  const id = youtubeId(url);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  if (!id) return null;

  const poster = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

  return (
    <section className="px-6">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-3">
        <p className="font-mono text-sm text-oxley-700 uppercase">
          The film
        </p>
        <div className="relative aspect-video w-full overflow-hidden bg-oxley-700/10">
          <Image
            src={poster}
            alt={`${title} film poster`}
            fill
            sizes="(min-width: 1120px) 1120px, 100vw"
            // A YouTube video still (already lossy) — the site floor, not
            // the photography 100; re-encoding higher would only add bytes.
            quality={IMAGE_QUALITY}
            className="object-cover"
          />

          {/* The scrim and the chip belong to the press target, so they leave
              with it. The poster underneath is what carries the continuity. */}
          {!playing && (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Play the film: ${title}`}
              className="group absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxley-300"
            >
              <span className="absolute inset-0 bg-surface/20 transition-colors duration-300 group-hover:bg-surface/5" />
              <span className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-surface/60 backdrop-blur-sm transition-transform duration-200 ease-out-quart group-active:scale-95 group-active:duration-0 motion-safe:group-hover:scale-105 sm:size-20">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="size-7 text-on-surface sm:size-8"
                >
                  {/* Centroid at (12,12) so the triangle sits optically centered. */}
                  <path d="M8.5 5v14l10.5-7z" />
                </svg>
              </span>
            </button>
          )}

          {playing && (
            <iframe
              src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
              title={`${title} — film`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setReady(true)}
              className={`absolute inset-0 h-full w-full transition-opacity duration-200 ease-out-quart ${
                ready ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>
        {note && (
          <p className="text-base leading-[1.3] text-oxley-700">{note}</p>
        )}
      </div>
    </section>
  );
}
