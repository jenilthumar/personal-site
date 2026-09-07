"use client";

import { useSyncExternalStore } from "react";
import type { FeedProject } from "@/lib/content";
import { FeedIndex } from "./FeedIndex";
import { InlineScript } from "./InlineScript";
import { useFeedNav } from "./useFeedNav";
import { WorkFeed } from "./WorkFeed";

/**
 * The home work area in one of two views: "scroll" (the media feed, default)
 * or "grid" (the classic card grid). The choice persists in localStorage.
 *
 * Both views stay mounted and CSS picks one via the wrapper's data-mode, so
 * an inline script can restore the saved view before first paint on hard loads
 * — no flash of the wrong view.
 *
 * The mode is read through useSyncExternalStore: its server snapshot is the
 * default ("scroll"), so the first client render matches the server HTML (the
 * toggle's aria-pressed would otherwise mismatch and warn); after hydration it
 * swaps to the stored value with no flash, since CSS + the inline script own
 * the visual. The same store backs the toggle's writes and keeps tabs in sync.
 *
 * A sticky toolbar sits across the top: the project index on the left (scroll
 * view only) and the Scroll/Grid switch on the right, level with the sidebar
 * name. It pins to the viewport top so the index stays reachable while
 * scrolling the feed.
 */

const STORAGE_KEY = "work-view";
type Mode = "scroll" | "grid";

const listeners = new Set<() => void>();

function readMode(): Mode {
  try {
    return localStorage.getItem(STORAGE_KEY) === "grid" ? "grid" : "scroll";
  } catch {
    return "scroll";
  }
}

function writeMode(next: Mode) {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // localStorage unavailable — the view still switches for this render.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  window.addEventListener("storage", notify); // cross-tab sync
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", notify);
  };
}

export function HomeView({
  feed,
  grid,
}: {
  feed: FeedProject[];
  /** The classic card grid, rendered on the server (it reads fs via lib/content). */
  grid: React.ReactNode;
}) {
  const mode = useSyncExternalStore(subscribe, readMode, () => "scroll");
  const { sectionsRef, active, jumpTo } = useFeedNav(
    feed.length,
    mode === "scroll",
  );

  // Active state is styled off the wrapper's data-mode (not React state) so
  // the inline script's pre-paint correction recolors the buttons too.
  const toggleClass: Record<Mode, string> = {
    scroll:
      "text-oxley-700 transition-colors hover:text-oxley-300 group-data-[mode=scroll]/mode:text-oxley-300",
    grid: "text-oxley-700 transition-colors hover:text-oxley-300 group-data-[mode=grid]/mode:text-oxley-300",
  };

  return (
    <div id="work-views" data-mode={mode} suppressHydrationWarning className="group/mode">
      {/* Toolbar: project index (left, scroll view) + view switch (right).
          Pinned to the viewport top; on desktop the negative margin lifts it
          out of the main column's 52px offset so it lands level with the
          sidebar name. */}
      <div className="sticky top-0 z-20 flex items-baseline justify-between gap-4 bg-surface py-4 text-base leading-[1.3] lg:-mt-[76px] lg:pt-6">
        <div className="min-w-0 group-data-[mode=grid]/mode:invisible">
          <FeedIndex projects={feed} active={active} jumpTo={jumpTo} />
        </div>

        <div className="flex shrink-0 gap-4">
          <button
            type="button"
            onClick={() => writeMode("scroll")}
            aria-pressed={mode === "scroll"}
            data-cuelume-toggle
            className={toggleClass.scroll}
          >
            Scroll
          </button>
          <button
            type="button"
            onClick={() => writeMode("grid")}
            aria-pressed={mode === "grid"}
            data-cuelume-toggle
            className={toggleClass.grid}
          >
            Grid
          </button>
        </div>
      </div>

      <div className="group-data-[mode=grid]/mode:hidden">
        <WorkFeed projects={feed} sectionsRef={sectionsRef} />
      </div>
      <div className="group-data-[mode=scroll]/mode:hidden">{grid}</div>

      <InlineScript
        html={`{try{var m=localStorage.getItem("${STORAGE_KEY}");if(m==="grid"||m==="scroll")document.getElementById("work-views").setAttribute("data-mode",m)}catch(e){}}`}
      />
    </div>
  );
}
