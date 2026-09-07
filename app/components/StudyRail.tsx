"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { StudySection } from "@/lib/content";
import { ChevronMark } from "./PixelMarks";

/**
 * How much of the article is behind you, as a ring.
 *
 * It replaced a hairline running the height of the section list, filled from
 * the top. That drew a rule down the left of a page that has no other rules on
 * it, and it made the reader measure a length against a length to get a
 * figure. A ring is one glyph: you read it the way you read a clock, at the
 * size of a full stop, and it sits with the back link instead of alongside the
 * text it isn't about.
 *
 * The drawing is the theme switch's — r=5.25 on a 16 grid, 1.5 stroke — so the
 * two circular marks on this site are the same object. It's painted at 20px
 * rather than 16 by scaling the box and leaving the viewBox alone, which takes
 * the stroke up with it: the mark is the same shape a step larger, not a
 * redrawn one. At 16 it sat below the cap height of the word beside it and
 * read as a bullet.
 *
 * Starts at twelve o'clock and runs clockwise, which is the only direction a
 * dial reads. No transition: the value tracks the scroll one-to-one, and an
 * arc easing toward where the page already is reads as lag.
 */
function ProgressRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 5.25;
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 16 16"
      fill="none"
      // The list already says which section you're in, and `aria-current`
      // says it out loud. This is the same fact as a fraction, and a live
      // percentage announcing itself on every scroll tick is noise.
      aria-hidden="true"
      className="shrink-0"
    >
      <circle
        cx="8"
        cy="8"
        r="5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-oxley-700/40"
      />
      <circle
        cx="8"
        cy="8"
        r="5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - value)}
        transform="rotate(-90 8 8)"
        className="text-oxley-300"
      />
    </svg>
  );
}

/**
 * The rail down the left of a study-format case study: the way out, how far in
 * you are, and a way to anywhere else in the piece.
 *
 * Set in Inter at the body size rather than in the mono, and unnumbered. The
 * mono is this site's metadata face and the numbers were bookkeeping — between
 * them they made a six-item list read as a table of contents in a manual. What
 * a reader wants here is the six words, and the words are prose, so they take
 * the prose face. The section labels in the body dropped their numbers with
 * these; a counter in one place and not the other is worse than neither.
 *
 * Two states carry everything now: the current section is the only one in the
 * emphasis token, and the ring beside the back link says how much is left.
 *
 * Desktop only. Below `lg` there's no column to spare beside the reading
 * column, and the same list is rendered as a disclosure above the body — see
 * StudyContents.
 */
export function StudyRail({ sections }: { sections: StudySection[] }) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    const headings = sections.map(({ id }) => document.getElementById(id));
    const body = document.querySelector<HTMLElement>("[data-study-body]");

    const measure = () => {
      frame.current = 0;

      // The reading line: a third of the way down the window. A section
      // becomes current when its heading crosses that, not when it touches the
      // top edge — by the time a heading reaches the very top you have been
      // reading its first paragraph for a while, and a rail that only agrees
      // with you then is a rail that is always one section behind.
      const line = window.innerHeight / 3;
      let current = 0;
      headings.forEach((heading, index) => {
        if (heading && heading.getBoundingClientRect().top <= line) {
          current = index;
        }
      });
      setActive(current);

      if (body) {
        const { top, height } = body.getBoundingClientRect();
        // How much of the article has gone past, as a fraction of how much of
        // it can. Full when its last line sits on the bottom edge — which is
        // when the reader is in fact done, rather than when its top has
        // scrolled off.
        const travel = height - window.innerHeight;
        setProgress(travel > 0 ? Math.min(1, Math.max(0, -top / travel)) : 1);
      }
    };

    // rAF-coalesced: scroll fires far more often than the screen redraws, and
    // every run of this reads layout.
    const onScroll = () => {
      if (!frame.current) frame.current = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  // The anchors work on their own; this only upgrades the jump to a glide.
  // Keeping the href real is what lets a section link be copied, opened in a
  // new tab, and followed with scripting off.
  const jump = useCallback((event: React.MouseEvent, id: string) => {
    const target = document.getElementById(id);
    if (!target || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
    history.replaceState(null, "", `#${id}`);
  }, []);

  return (
    <nav
      aria-label="Sections"
      className="hidden shrink-0 text-base leading-[1.3] lg:sticky lg:top-24 lg:block lg:h-fit lg:w-[160px]"
    >
      {/* How far in, then the way out — the ring leads because it's the one
          thing on the rail that changes as you read, and 8px is close enough
          that the pair reads as one control rather than as a mark and a link
          that happen to share a line.

          "Back" points at the work index rather than at browser history:
          history is wherever you happen to have come from, and on a page
          reached from a link or a search that's nowhere. Same destination the
          masthead's collapsed Projects folder uses. */}
      <div className="mb-8 flex items-center gap-2">
        <ProgressRing value={progress} />
        <Link
          href="/#projects"
          data-cuelume-hover="tick"
          className="group/back inline-flex items-center gap-2 text-oxley-700 transition-colors hover:text-on-surface"
        >
          {/* The site's own chevron, turned. It nudges the way the one after
              "View project" used to, in two quantised pixel steps rather than
              gliding — a pixel mark that slides continuously stops looking
              like a pixel mark. */}
          <ChevronMark className="rotate-180 transition-[translate] duration-150 ease-[steps(2,jump-start)] motion-safe:group-hover/back:-translate-x-0.5" />
          Back
        </Link>
      </div>

      <ol className="flex flex-col gap-3">
        {sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={(event) => jump(event, section.id)}
              data-cuelume-hover="tick"
              data-cuelume-toggle="page"
              aria-current={index === active ? "true" : undefined}
              className={`block transition-colors duration-200 ease-out-quart ${
                index === active
                  ? "text-oxley-300"
                  : "text-oxley-700 hover:text-body"
              }`}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * The same index below `lg`, as a disclosure above the body.
 *
 * A phone has no column to spare for a rail, and a long case study without a
 * way to skip is exactly where a reader gives up. Closed by default so it
 * costs a line rather than a screen, and JS-free — it rides the site's
 * `<details>` easing from globals.css. No rules around it: the body it sits
 * above doesn't draw any either, and a boxed disclosure on a page with no
 * other boxes reads as something bolted on.
 */
export function StudyContents({ sections }: { sections: StudySection[] }) {
  return (
    <details className="reveal group mt-12 mb-4 lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-mono text-sm text-oxley-700 transition-colors hover:text-body [&::-webkit-details-marker]:hidden">
        Contents
        <svg
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          className="size-3 transition-transform duration-200 ease-out-quart group-open:rotate-45"
        >
          <path
            d="M6 1.5v9M1.5 6h9"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </summary>
      <ol className="flex flex-col gap-2 pb-5">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              // Same pair the rail's rows carry above. The tick is dead weight
              // on a phone, where this disclosure lives, but the disclosure
              // shows up on any narrow window with a mouse in it too.
              data-cuelume-hover="tick"
              data-cuelume-toggle="page"
              className="block text-base leading-[1.4] text-body"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}
