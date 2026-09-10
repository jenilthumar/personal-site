"use client";

import { useEffect } from "react";

/**
 * How far the cascade is allowed to run, in --reveal-order steps of 40ms
 * (app/globals.css) — so 240ms end to end.
 *
 * Past about a quarter of a second a stagger stops reading as one thing
 * arriving and starts reading as a queue, and a first screen with a dozen
 * blocks on it would otherwise spend half a second assembling. Six is enough
 * to see a direction in it.
 */
const STAGGER_CAP = 6;

/**
 * The `.reveal` entrance (see globals.css for the motion itself). Renders
 * nothing: on mount it stamps `data-visible` on every `.reveal` in the
 * document, which is what releases them from the hidden state.
 *
 * Everything, in one pass, at mount — there is no scroll observer here.
 * What is on screen when the page loads cascades top to bottom, 40ms apart.
 * Everything below the fold is stamped in the same frame and additionally
 * marked `data-settled`, which drops its transition: those blocks are simply
 * in place, and the reader who scrolls to them finds a page rather than a page
 * assembling itself.
 *
 * That division is the whole design. This used to observe every block and
 * animate it as the scroll reached it, and the trouble with that is it makes a
 * reader wait for content they have already navigated to — the faster they
 * scroll, the more of it they wait for. An entrance is for a page arriving. It
 * has nothing to say about a paragraph you deliberately scrolled to, and
 * saying it anyway is the thing that makes long pages feel slow. Modelled on
 * shedsgns.me, which bakes its delays in at render and observes nothing.
 *
 * Settling the below-fold blocks rather than letting them animate off-screen
 * is not only semantics: the entrance carries a 4px blur, and 60-odd blurred
 * compositing layers all transitioning at once on load is a real cost on a
 * phone for motion nobody can see.
 *
 * One class on any element is the whole API. No wrapper node, so flex-critical
 * elements (the home statement's sizing box, LineField's full-bleed band) take
 * the class without their layout knowing; opacity, filter and transform touch
 * neither box size nor flex arithmetic.
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

    // One layout read for the lot. The effect runs after paint, so this is the
    // laid-out page; images still loading can only shift a block across the
    // fold line, and either side of that line is a defensible answer for one.
    const fold = window.innerHeight;
    const onScreen: { el: HTMLElement; top: number }[] = [];

    // Every rect is read here and kept, so the sort below compares numbers.
    // Measuring inside a comparator would force a layout per comparison.
    for (const el of hidden) {
      const { top, bottom } = el.getBoundingClientRect();
      if (top < fold && bottom > 0) onScreen.push({ el, top });
      // Below the fold, or above it on a restored scroll position: in place,
      // no transition, no cost.
      else el.dataset.settled = "";
    }

    // Visual order, not document order — the two disagree wherever a page puts
    // a row of figures side by side.
    onScreen
      .sort((a, b) => a.top - b.top)
      .forEach(({ el }, i) => {
        el.style.setProperty("--reveal-order", String(Math.min(i, STAGGER_CAP)));
      });

    for (const el of hidden) el.dataset.visible = "";
  }, []);

  return null;
}
