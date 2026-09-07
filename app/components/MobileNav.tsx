"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { play } from "cuelume";
import Link from "next/link";
import { site } from "@/lib/site";
import { SoundToggle } from "./SoundToggle";
import { ThemeToggle } from "./ThemeToggle";
import {
  emailLink,
  FolderGroup,
  resumeHref,
  SheetRow,
  type NavItem,
} from "./nav-parts";
import type { NavInk } from "./TopNavBar";

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
 * toggle never move — the menu mark folds into a cross in place and the panel
 * fills in behind. That's also why there's no second close button and no
 * repeated wordmark: the bar was never covered, so it doesn't need reprinting.
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
 * last row spent its life sliced in half at the bottom of the screen. The
 * theme switch, which used to be down there too, is in the bar now — it isn't
 * navigation and it shouldn't need a menu opened to reach it.
 *
 * This is the one client component in the masthead, and only because a menu
 * has to close itself: on navigation (a tap that leaves the panel up is the
 * bug that makes sheets feel broken), on Escape, and with the page behind it
 * held still while it's open.
 */
/**
 * The bar's control: two rules that fold into a cross.
 *
 * It replaced the word "Menu" turning into the word "Close" with a chevron
 * beside it. The word was honest and it was also the widest thing in the
 * corner — a label, a mark and a dial, three objects for two controls — and
 * "Close" is a longer word than "Menu", so the switch beside it shifted every
 * time the sheet opened. Two rules cost 18px and never change width.
 *
 * Two and not the usual three. A cross has two strokes, so a three-rule mark
 * has to get rid of one on the way, and the middle one collapsing is the only
 * part of the move that isn't the shape rearranging itself — it's a shape
 * being swapped for a different shape while you look away. With two, every
 * stroke that starts is a stroke that lands, and the mark is the same object
 * before and after. Same argument the theme switch makes about being one disc
 * that turns rather than a sun and a moon taking turns.
 *
 * ── The fold ────────────────────────────────────────────────────────────────
 * Two moves, not one. The rules travel to the middle line first, then turn;
 * closing turns them back before they part. Run together they read as a flip —
 * two bars pivoting through each other on their way somewhere — and running
 * them in order is the difference between a mark that changes and a mark that
 * folds. Each leg is 200ms and the second starts at 100, so they overlap by
 * half and the whole thing is 300ms, which is a control's budget rather than
 * an animation's.
 *
 * That's a span per rule and a span inside it, for the same reason the theme
 * switch nests two: travel and turn are on separate clocks, and one element
 * can hold two transforms but not two transitions.
 *
 * ease-out-quart throughout — the house curve, because this is a thing the
 * reader pressed. Nothing here gets the detent the switch has: a detent is for
 * something that lands in a notch, and a cross is a shape, not a position.
 *
 * Geometry: an 8.5px box, two 1.5px rules on its top and bottom edges. Half of
 * 8.5 less half a rule is 3.5, which is the travel — far enough that the two
 * land on one line and the cross is a cross rather than a very sharp X.
 *
 * Only the transitions are motion-safe. The transforms themselves aren't, so a
 * reader who has asked for less motion still gets a cross when the sheet is
 * open; they just get it in the frame the tap landed on.
 */
function MenuMark({ open }: { open: boolean }) {
  // One curve and one duration for both legs of the fold; only the delay
  // differs, and that's the whole mechanism. Kept off the sizing classes so
  // there's nothing for Tailwind to have to break a tie about.
  const glide =
    "motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out-quart";
  const rule = "absolute inset-x-0 h-[1.5px]";
  const bar = `block h-full w-full bg-current ${glide}`;

  return (
    <span aria-hidden="true" className="relative block h-[8.5px] w-[18px]">
      <span
        className={`${rule} top-0 ${glide} ${
          open ? "translate-y-[3.5px]" : "motion-safe:delay-100"
        }`}
      >
        <span
          className={`${bar} ${open ? "rotate-45 motion-safe:delay-100" : ""}`}
        />
      </span>

      <span
        className={`${rule} top-[7px] ${glide} ${
          open ? "-translate-y-[3.5px]" : "motion-safe:delay-100"
        }`}
      >
        <span
          className={`${bar} ${open ? "-rotate-45 motion-safe:delay-100" : ""}`}
        />
      </span>
    </span>
  );
}

export function MobileNav({
  projects,
  photography,
  ink,
}: {
  projects: NavItem[];
  photography: NavItem[];
  /** Set when the bar is over a hero. The bar takes it; the sheet never does. */
  ink?: NavInk;
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
      <div
        className={`relative z-60 flex h-11 items-center justify-between gap-4 text-base leading-[1.2] ${
          ink ? `nav-ink-${ink}` : ""
        }`}
      >
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
          data-cuelume-hover="tick"
          onClick={() => setOpen(false)}
          className="flex h-11 items-center font-medium text-on-surface hover:text-oxley-300"
        >
          {site.name}
        </Link>

        <div className="flex items-center">
          {/* Before Menu rather than after it. The wide bar puts the switch
              last because the switch is the last thing on that bar; here the
              last thing is the menu, and the corner belongs to the control the
              reader is actually reaching for. On a phone the far corner is
              also the easiest thing on the bar to hit without moving your
              hand, and that shouldn't be spent on the button you press twice
              a year.

              It's in the bar and not in the sheet because the sheet is a
              height budget (see the panel below) and this is the one control
              in the masthead that has nothing to do with where you're going.
              Somewhere you have to open a menu to reach is the wrong place for
              the thing you press when the room gets dark.

              No margins anywhere in here: 44px boxes edge to edge is what the
              old note was arguing for and couldn't have while one of them was a
              word. The targets meet on lines and never overlap, so the mis-tap
              that repaints the whole site instead of just going somewhere has
              nowhere to happen. What separates the marks is the boxes' own
              padding — 14px either side of the disc, 13 off the rules, 14 off
              the meter — rather than a gap anyone set.

              The mute switch joins the pair on the same terms, and the order is
              the wide bar's read backwards for the same reason the theme switch
              sits where it does: distance from the corner is how often you
              reach for a thing. Menu, then theme, then sound. Three 44px boxes
              plus the wordmark come to 199px of a 358px row at 390, so the row
              is nowhere near tight — the argument for the third control is that
              a site that makes noise has to let you stop it without hunting,
              and a mute you have to open a menu to find is not one. */}
          <SoundToggle />
          <ThemeToggle />

          <button
            ref={toggle}
            type="button"
            onClick={() =>
              setOpen((wasOpen) => {
                // A panel filling in behind the bar and a panel leaving are
                // opposite gestures, so they get opposite cues rather than one
                // click both ways: bloom is a warm swell, droplet is a single
                // note gliding down. Imperative rather than
                // `data-cuelume-toggle` because one attribute can only name one
                // sound, and the mark under the finger is the same mark in both
                // states.
                play(wasOpen ? "droplet" : "bloom");
                return !wasOpen;
              })
            }
            aria-expanded={open}
            aria-controls="site-menu"
            // The name stays "Menu" in both states. aria-expanded is already
            // saying open or shut, and a label that also flips to "Close"
            // makes a screen reader read the state twice, in two vocabularies.
            aria-label="Menu"
            // Square, and the same 44 the switch beside it takes, so the two
            // controls in this corner are a pair rather than a word and a
            // dial.
            //
            // -mr-[13px] is the box's own padding, taken back off the right
            // edge: 44 less the 18px mark, halved. Without it the bar would
            // end 13px past where every other row on the page ends, and the
            // thing aligned to the margin would be an invisible tap target
            // rather than the rules you can see. Same trick the switch used to
            // do here with -mr-3.5, and for the same reason — it just isn't
            // the one on the edge any more.
            className="-mr-[13px] flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center text-on-surface hover:text-oxley-300"
          >
            <MenuMark open={open} />
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
          // address and the theme toggle it then sat beside were simply below
          // the fold, cut off mid-glyph at the window edge. Everything is sized
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
                <SheetRow label="Resume" href={resumeHref} />
              </li>
            </ul>
          </nav>

          {/* Pinned to the bottom of the sheet, on the site's own hairline.

              The label used to share this line with the theme toggle, which is
              now in the bar above. Nothing takes its place: a label and an
              address are a caption and the thing it captions, and with the row
              down to one item the flex that spread it is a `justify-between`
              with nothing to push against.

              The label is not part of the link. It never earned being one —
              the address is the affordance, and the tap opens a compose
              window. White is the token this design reserves for footer
              navigation, so the address carries the emphasis and the label
              stays muted. */}
          <div className="mt-auto flex flex-col gap-2 border-t border-oxley-700/25 pt-5">
            <p className="font-mono text-base leading-[1.2] text-oxley-700">
              Get in touch
            </p>
            <a
              href={emailLink?.href}
              data-cuelume-hover="tick"
              data-cuelume-toggle="success"
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
