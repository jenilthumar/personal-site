"use client";

import { useEffect, useRef } from "react";
import { mediaUrl } from "@/lib/media";

/**
 * Looping video hero — fills the 2.10:1 ProjectHero frame in place of the still
 * image. Muted and silent, the moving counterpart to the static cover. Poster
 * (the still hero image) shows before playback and stays put for
 * prefers-reduced-motion visitors, who never see the loop. See CaseVideo for
 * the same playback approach used in project bodies.
 */
export function HeroVideo({
  src,
  poster,
  alt = "",
}: {
  src: string;
  poster?: string;
  alt?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (reduce.matches) video.pause();
      else void video.play().catch(() => {});
    };

    sync();
    reduce.addEventListener("change", sync);
    return () => reduce.removeEventListener("change", sync);
  }, []);

  return (
    <video
      ref={ref}
      src={mediaUrl(src)}
      poster={poster ? mediaUrl(poster) : undefined}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={alt || undefined}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
