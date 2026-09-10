"use client";

import { useEffect } from "react";

/**
 * Holds the masthead's entrance to one run per document.
 *
 * The fade is declared on <header> (TopNavBar), and TopNav is mounted by the
 * (site) layout and, separately, by StudyView, ProjectView and
 * PhotographyView — the routes outside that shell draw their own. Crossing
 * between the two shells replaces the header node, and app/work/template.tsx
 * remounts per slug, so following Next Work from one case study to the next
 * builds another one. A new node restarts the animation, and the bar that is
 * meant to be the site's one constant refades on the most-used navigation
 * there is.
 *
 * Mounted in the root layout, which is the only thing on this site that never
 * remounts, so the effect runs exactly once per document. It waits on the
 * running animation's own `finished` promise rather than a timeout, so the
 * flag lands when the fade actually ends; if there is no animation to wait on
 * — hydration arrived late and it has already finished — the flag goes up
 * immediately.
 *
 * Renders nothing. Same arrangement as Reveal and SoundCues.
 */
export function NavEntrance() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.navSeen !== undefined) return;

    const header = document.querySelector<HTMLElement>(".animate-nav-in");
    const entrance = header
      ?.getAnimations()
      .find(
        (animation): animation is CSSAnimation =>
          animation instanceof CSSAnimation &&
          animation.animationName === "nav-in",
      );

    if (!entrance) {
      root.dataset.navSeen = "";
      return;
    }

    let live = true;
    entrance.finished
      .then(() => {
        if (live) root.dataset.navSeen = "";
      })
      // Rejects if the animation is cancelled, which is not a failure — the
      // header went away, and the next one will start this over.
      .catch(() => {});

    return () => {
      live = false;
    };
  }, []);

  return null;
}
