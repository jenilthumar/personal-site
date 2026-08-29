"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { site } from "@/lib/site";
import { ChevronMark } from "./PixelMarks";
import { ThemeToggle } from "./ThemeToggle";
import { emailLink, FolderGroup, SheetRow, type NavItem } from "./nav-parts";

/**
 * The masthead below `lg`: a 44px bar, and a sheet behind it.
 *
 * What this replaced was a light rounded card holding a 2x2 grid of lighter
 * tiles — 207px, a quarter of a 390x844 screen, on every page before the
 * writing started. Three things were wrong with it beyond the height: a nav
 * that is always open is the one thing a phone has no room for; it was a card
 * inside a card, the heaviest grouping available, for four links; and a solid
 * #e6e6e6 slab is exactly the large light panel a dark design is supposed to
 * avoid. The bar costs 44px and the work starts 163px sooner.
 *
 * The sheet opens *under* the bar rather than over it, so the name and the
 * toggle never move — "Menu" becomes "Close" in place and the panel fills in
 * behind. That's also why there's no second close button and no repeated
 * wordmark: the bar was never covered, so it doesn't need reprinting.
 *
 * Inside, it's the same index the wide bar draws, from the same file — the old
 * tiles were a second way of drawing the same four destinations, and the
 * disclosures inside them were a third way of reaching a case study. It is not
 * the bar stacked, though, and the last pass over this file is mostly about
 * that: a row of columns and a single column ask different questions, so the
 * sheet has its own row (SheetRow) and its own way of marking a folder. The
 * notes in nav-parts carry the reasoning.
 *
 * Everything in here is sized against one budget: the panel is fixed to the
 * window with its footer pinned to the bottom edge, so anything past the
 * window's height isn't laid out further down the page — it's cut off. The
 * previous arrangement came to 828px of content, which no phone has, and the
 * theme toggle spent its life sliced in half at the bottom of the screen.
 *
 * This is the one client component in the masthead, and only because a menu
 * has to close itself: on navigation (a tap that leaves the panel up is the
 * bug that makes sheets feel broken), on Escape, and with the page behind it
 * held still while it's open.
 */
export function MobileNav({
  projects,
  photography,
}: {
  projects: NavItem[];
  photography: NavItem[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);

  // A backstop for navigation this component didn't start — browser back and
  // forward, mostly. It cannot be the only thing that closes the sheet: a tap
  // on a link pointing at the page you're already on leaves the path exactly
  // where it was, so this never fires. That's what closeOnLink is for.
  //
  // Adjusted during render rather than in an effect: React re-runs the
  // component immediately without committing the open panel, where an effect
  // would paint it once and then close it. Same reason react-hooks flags
  // setState inside an effect body.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  /**
   * Close whenever a link inside the sheet is activated, wherever it points.
   *
   * Delegated rather than bound per link, so the two folder lists, the standing
   * pages, the address and anything added later are all covered without having
   * to remember. Keyboard activation raises a click too, so Enter behaves the
   * same as a tap.
   */
  const closeOnLink = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest("a")) setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Send focus back to the control that opened it, not to the top of the
      // document, so a keyboard user keeps their place.
      toggle.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    // Hold the page behind the sheet still. The panel scrolls on its own.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      {/* Sits above the sheet so the toggle stays live and the name stays put. */}
      <div className="relative z-60 flex h-11 items-center justify-between gap-4 text-base leading-[1.2]">
        {/* Outside the sheet, so it isn't covered by closeOnLink. Tapping it
            from the home page is the case that exposed all of this: it routes
            to where you already are, so nothing changes and the sheet used to
            just sit there over the page it had supposedly taken you to.

            Full bar height, so the name is a 44px target rather than the 19px
            its cap height would give it. Costs nothing: the bar is already
            that tall and the row centres it. */}
        <Link
          href="/"
          aria-label="Homepage"
          onClick={() => setOpen(false)}
          className="flex h-11 items-center font-medium text-on-surface hover:text-oxley-300"
        >
          {site.name}
        </Link>

        <div className="flex items-center">
          <button
            ref={toggle}
            type="button"
            onClick={() => setOpen((wasOpen) => !wasOpen)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="flex h-11 items-center gap-1.5 pl-3 font-medium text-on-surface hover:text-oxley-300"
          >
            {open ? "Close" : "Menu"}
            {/* The chevron turns rather than swapping for a second glyph. It
                travels, so it waits for motion-safe; the label alone carries
                the state otherwise. */}
            <ChevronMark
              className={`motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out-quart ${
                open ? "rotate-90" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {open && (
        <div
          id="site-menu"
          // 96px of top padding leaves 36 clear below the bar, which ends at
          // 60. It used to be 116, chosen so the first row began on exactly
          // the line the statement begins on with the menu shut — a nice
          // coincidence that stopped being affordable. The sheet is a fixed
          // panel with a footer pinned to its bottom edge, and the whole thing
          // measured 828px of content: on any phone shorter than that the
          // address and the theme toggle were simply below the fold, cut off
          // mid-glyph at the window edge. Everything in here is now sized
          // against a height budget first, and this is the largest single line
          // item that was purely decorative.
          //
          // A column, not a stack: the nav takes the top and the address is
          // pushed to the bottom edge, so the space left over sits between two
          // anchored things instead of trailing off under the last link. The
          // gap is what keeps the hairline off the last row when the two meet
          // — `mt-auto` alone gives the footer everything or nothing.
          //
          // `overscroll-contain` for the phones where it still doesn't fit:
          // without it, scrolling past the end of a fixed panel hands the
          // gesture to the page underneath, which is being held still, so the
          // sheet feels stuck rather than finished.
          onClick={closeOnLink}
          className="fixed inset-0 z-50 flex animate-fade-in flex-col gap-5 overflow-y-auto overscroll-contain bg-surface px-4 pt-24 pb-5"
        >
          {/* One size for every destination, and it's 24px rather than the 32
              the sections used to take. 32 was the site's page-title size, and
              a menu borrowing it made the nine rows in here read as nine
              headings; it also cost 20px a row against a panel that already
              didn't fit. What sets a folder apart from the pages under it is
              the mono label above it, not a size — see the note in nav-parts.

              Tracking is the footer's -0.01em rather than a pixel value, so it
              holds if the size ever moves. */}
          <nav
            aria-label="Site"
            className="flex flex-col gap-6 text-2xl leading-[1.2] tracking-[-0.01em]"
          >
            <FolderGroup
              sheet
              label="Projects"
              items={projects}
              current={pathname}
            />
            <FolderGroup
              sheet
              label="Photography"
              items={photography}
              current={pathname}
            />
            {/* Flush with the folder items and on the same rhythm, because on
                this site they are the same kind of thing — the wide bar sets
                About beside Projects, not under it. They carry no label of
                their own: the space above them says "and everything else"
                without a word being invented for it. */}
            <ul role="list" className="flex flex-col">
              <li>
                <SheetRow label="About" href="/about" current={pathname} />
              </li>
              <li>
                <SheetRow label="Running" href="/running" current={pathname} />
              </li>
              <li>
                <SheetRow label="Resume" href={site.resume} />
              </li>
            </ul>
          </nav>

          {/* Pinned to the bottom of the sheet, on the site's own hairline.
              The label and the toggle share a line — both are mono, both are
              muted, so they read as one strip of small print rather than two
              things stacked — and that hands the address the full width back.
              It needs it: 26 characters at 20px measure 278px against 358 of
              phone, so a toggle on the same line would leave nothing under
              380px. The address drops to 18 there anyway, where 20 runs over
              the gutters.

              The label is no longer part of the link. It never earned being
              one — the address is the affordance, and the tap opens a compose
              window. White is the token this design reserves for footer
              navigation, so the address carries the emphasis and the label
              stays muted. */}
          <div className="mt-auto flex flex-col gap-2 border-t border-oxley-700/25 pt-5">
            <div className="flex items-center justify-between gap-4 font-mono text-base leading-[1.2] tracking-normal text-oxley-700">
              <span>Get in touch</span>
              <ThemeToggle />
            </div>
            <a
              href={emailLink?.href}
              className="w-fit text-[18px] leading-[1.2] font-medium tracking-[-0.01em] text-oxley-300 min-[380px]:text-[20px]"
            >
              {emailLink?.href.replace("mailto:", "")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
