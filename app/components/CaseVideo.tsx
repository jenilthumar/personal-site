"use client";

import { useEffect, useRef } from "react";
import { mediaUrl } from "@/lib/media";

/**
 * Full-bleed silent video for a case-study body — the moving-image counterpart
 * to <Full>. Muted, looping, inline: a soundless demo, no controls or chrome.
 *
 * Playback is driven here rather than via the markup `autoplay` attribute so we
 * can honour prefers-reduced-motion: those visitors hold on the poster (or first
 * frame) and never see the loop. Everyone else plays on mount.
 */
export function CaseVideo({
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
    const sync = () => {
      if (reduce.matches) {
        video.pause();
      } else {
        // play() rejects if the tab is backgrounded / not yet interactive — the
        // muted-inline case is allowed, so just ignore the rejection.
        void video.play().catch(() => {});
      }
    };

    sync();
    reduce.addEventListener("change", sync);
    return () => reduce.removeEventListener("change", sync);
  }, []);

  return (
    <div
      className="relative my-24 w-full overflow-hidden bg-oxley-700/10"
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
