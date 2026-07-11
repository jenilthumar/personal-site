"use client";

import { useEffect, useRef } from "react";
import { mediaUrl } from "@/lib/media";

/**
 * A video block in the home feed — the same silent, chrome-less treatment as
 * CaseVideo, minus the case-study margins. The feed can hold several videos
 * at once, so playback follows visibility: play in view, pause out of view.
 * prefers-reduced-motion holds on the poster (or first frame) throughout.
 */
export function FeedVideo({
  src,
  poster,
  aspect = "16/9",
  alt = "",
}: {
  src: string;
  poster?: string;
  aspect?: string;
  alt?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;

    const sync = () => {
      if (inView && !reduce.matches) {
        // play() rejects if the tab is backgrounded / not yet interactive —
        // the muted-inline case is allowed, so just ignore the rejection.
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    reduce.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      reduce.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-oxley-700/10"
      style={{ aspectRatio: aspect.replace("/", " / ") }}
    >
      <video
        ref={ref}
        src={mediaUrl(src)}
        poster={poster ? mediaUrl(poster) : undefined}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={alt || undefined}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
