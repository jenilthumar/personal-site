"use client";

import { useEffect } from "react";

/**
 * The observer behind the `.reveal` entrance (see globals.css for the motion
 * itself). Renders nothing: it watches every `.reveal` element on the page and
 * stamps `data-visible` the first time each one enters the viewport, which is
 * what starts the sweep. Elements already on screen at mount get theirs
 * immediately — that's the page-load choreography — and everything below the
 * fold waits for the scroll to reach it.
 *
 * Stagger is worked out here rather than authored per element, because only
 * the viewport knows what actually arrives together: whatever lands in the
 * same observer callback is sorted by where it sits on screen and dealt
 * --reveal-order 0, 1, 2… so the cascade always runs top to bottom no matter
 * which subset of the page it is. The order is capped at 6 — beyond half a
 * second of delay a stagger stops reading as choreography and starts reading
 * as a page that hasn't loaded.
 *
 * One class on any element is the whole API. No wrapper node, so flex-critical
 * elements (the home statement's sizing box, LineField's full-bleed band) take
 * the class without their layout knowing; opacity and transform touch neither
 * box size nor flex arithmetic.
 *
 * Mounted from the template.tsx files, not a layout: templates remount per
 * navigation, which is what re-arms the scan for the fresh DOM — a layout
 * would run this once and never see the next page's elements. It queries the
 * whole document rather than a subtree so the one component covers whichever
 * shell it's mounted under.
 *
 * Deliberately fire-and-forget: no MutationObserver for late arrivals. Every
 * page here renders its blocks up front — anything mounted later (lightbox,
 * nav sheet) has its own entrance and shouldn't take this one.
 */
export function Reveal() {
  useEffect(() => {
    const hidden = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal:not([data-visible])"),
    );
    if (!hidden.length) return;

    // The scripting media query has already hidden the content by the time
    // this runs, so a browser that somehow lacks the observer must not be left
    // holding an invisible page: show everything, skip the choreography.
    if (!("IntersectionObserver" in window)) {
      hidden.forEach((el) => {
        el.dataset.visible = "";
      });
      return;
    }

    const io = new IntersectionObserver((entries) => {
      const incoming = entries
        .filter((entry) => entry.isIntersecting)
        // boundingClientRect comes with the entry — sorting on it costs no
        // layout read, unlike getBoundingClientRect here.
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      incoming.forEach((entry, i) => {
        const el = entry.target as HTMLElement;
        el.style.setProperty("--reveal-order", String(Math.min(i, 6)));
        el.dataset.visible = "";
        io.unobserve(el);
      });
    });

    hidden.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
