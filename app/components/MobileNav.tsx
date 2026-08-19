"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { site } from "@/lib/site";
import { ChevronMark } from "./PixelMarks";
import { ThemeToggle } from "./ThemeToggle";
import { emailLink, FolderGroup, PageLink, type NavItem } from "./nav-parts";

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
 * Inside, it's the desktop nav stacked. FolderGroup and PageLink are the same
 * components the wide bar uses, which is the point — the old tiles were a
 * second way of drawing the same four destinations, and the disclosures inside
 * them were a third way of reaching a case study.
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
            just sit there over the page it had supposedly taken you to. */}
        <Link
          href="/"
          aria-label="Homepage"
          onClick={() => setOpen(false)}
          className="font-medium text-on-surface hover:text-oxley-300"
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
          // 116px of top padding is not a round number, it's a measured one:
          // the bar ends at 60 and the shell puts gap-14 between the nav and
          // whatever follows it. So the first row of the menu starts on exactly
          // the line the statement starts on when the menu is shut, and opening
          // it reads as the page's own content changing rather than a layer
          // arriving from somewhere else.
          //
          // A column, not a stack: the nav takes the top and the address is
          // pushed to the bottom edge, so the space left over sits between two
          // anchored things instead of trailing off under the last link.
          onClick={closeOnLink}
          className="fixed inset-0 z-50 flex animate-fade-in flex-col overflow-y-auto bg-surface px-4 pt-29 pb-8"
        >
          {/* The four destinations carry the sheet at 32px — the size this site
              already titles a page with. The desktop bar sets them at 16 because
              they're one item in a wide row of them; alone on a phone screen
              that reads as a nav that forgot it had the room. */}
          <nav
            aria-label="Site"
            className="flex flex-col gap-10 text-[32px] leading-[1.3]"
          >
            <FolderGroup sheet label="Projects" items={projects} />
            <FolderGroup sheet label="Photography" items={photography} />
            <div className="flex flex-col gap-6">
              <PageLink label="About" href="/about" />
              <PageLink label="Running" href="/running" />
              <PageLink label="Resume" href={site.resume} />
            </div>
          </nav>

          {/* Pinned to the bottom of the sheet, on the site's own hairline. The
              address can't take the 32px the sections use — it measures 434px
              there against 358px of phone — so it sits at 20px under a mono
              label, dropping to 18 below 380px where 20 runs over the gutters.
              White is the token this design reserves for footer navigation, so
              the address carries the emphasis and the label stays muted. */}
          <div className="mt-auto flex flex-col gap-6 border-t border-oxley-700/25 pt-8">
            <a
              href={emailLink?.href}
              className="group/mail flex flex-col gap-2.5"
            >
              <span className="font-mono text-base leading-[1.2] tracking-normal text-oxley-700 transition-colors group-hover/mail:text-on-surface">
                Get in touch
              </span>
              <span className="text-[18px] leading-[1.2] font-medium tracking-[-0.16px] text-oxley-300 min-[380px]:text-[20px]">
                {emailLink?.href.replace("mailto:", "")}
              </span>
            </a>
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  );
}
