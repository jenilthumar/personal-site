"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll state for the work feed, shared between the media column (which owns
 * the section elements) and the index bar (which reports the active project
 * and jumps between them). The index lives in the top toolbar while the
 * sections live below, so the refs and the active-project state sit here where
 * both can reach them.
 */
export function useFeedNav(count: number, enabled: boolean) {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  // Active project = the last section whose top has crossed the viewport
  // midline. rAF-throttled; cheap enough to run per frame. Parked while the
  // grid view is showing (enabled=false).
  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const sections = sectionsRef.current;
      const midline = window.innerHeight * 0.5;
      let index = 0;
      sections.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= midline) index = i;
      });
      // A short last section may never cross the midline — claim it at the end.
      const bottom = window.innerHeight + window.scrollY;
      if (bottom >= document.documentElement.scrollHeight - 2) {
        index = sections.length - 1;
      }
      setActive(index);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [enabled, count]);

  const jumpTo = (index: number) => {
    sectionsRef.current[index]?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  return { sectionsRef, active, jumpTo };
}
