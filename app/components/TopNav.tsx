import Link from "next/link";
import { getWorkByCategory, workHref, type WorkItem } from "@/lib/content";
import { site } from "@/lib/site";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";
import {
  ContactMail,
  FolderGroup,
  PageLink,
  resumeHref,
  type NavItem,
} from "./nav-parts";

/**
 * The masthead. Two designed layouts, not one that bends: from `lg` it's the
 * wide bar — name, the work index and the standalone pages, the email address
 * on the right. Below that it's a 44px bar with a sheet behind it, in
 * MobileNav. Both draw with the same pieces, from nav-parts.
 */

export type { NavItem };

export function TopNav() {
  const toItem = (item: WorkItem): NavItem => ({
    slug: item.slug,
    title: item.title,
    href: workHref(item),
  });

  const projects = getWorkByCategory("project").map(toItem);
  const photography = getWorkByCategory("photography").map(toItem);

  return (
    // The one entrance that plays per hard load rather than per navigation:
    // the shell layout never remounts client-side, so this fade runs once and
    // the masthead then holds still while pages sweep beneath it. Opacity
    // only — the token's note in globals.css explains why it can't travel.
    //
    // `relative z-50` is not decoration, it's what makes the mobile sheet
    // opaque. That fade is declared `both`, so the animation stays in effect
    // after it finishes and the header keeps the stacking context an animating
    // opacity gives it — permanently, at z-index auto. Everything the sheet is
    // supposed to cover then outranks it by tree order alone: the home page's
    // LineField is `position: relative` inside <main>, which comes after
    // <header>, so the drawing painted straight through a `bg-surface` panel
    // that was already as opaque as CSS can make it. Nothing inside the header
    // can fix that — z-60 on the bar and z-50 on the sheet only sort the two
    // of them against each other. The header itself has to be the thing that
    // ranks, so it's given a z-index instead of inheriting one by accident.
    <header className="relative z-50 animate-nav-in">
      <MobileNav projects={projects} photography={photography} />

      <div className="hidden items-start text-base leading-[1.3] lg:flex">
        {/* Even gaps between the boxes are not even gaps between the words.
            Projects and Photography are as wide as the lists indented beneath
            them, not as wide as their headings — 131px against 58, 161 against
            91 — so a uniform gap read as 122, 118, then 48. About and Running
            looked stuck together while nothing else did.

            The fix is a constant trailing space, not a constant column. A
            fixed column only evens words of equal width: at 120px it gave 122
            after "About" (46px wide) and 106 after "Running" (62px), because
            what the eye reads is the gap from the end of one word to the start
            of the next. 72px of padding on each standalone page makes every
            box its own word plus the same tail, so every optical gap comes out
            as the flex gap plus roughly 72 whatever the word underneath it is.

            The address is the last item in that row rather than a thing pinned
            opposite it. `mr-auto` used to hand every spare pixel to the one
            gap before it — 258px at 1440 — which is what made it read as
            separate; `justify-between` spreads the same slack across all of
            them instead, so it lands on the right edge because the rhythm puts
            it there.

            It still steps out below `xl`: five nav items, the name and a
            26-character address need about 1145px of column before they fit at
            all, and rather more before the gaps are worth looking at. It's on
            every page in the footer and in the mobile sheet.

            The folder figures move with the longest title in each list, so if
            one grows a lot the 72 is the number to revisit. */}
        <nav
          aria-label="Site"
          className="flex flex-1 justify-between gap-x-6 pt-[6px]"
        >
          {/* The wordmark joins the row rather than sitting beside it. Held
              out as a sibling it was outside `justify-between` entirely, so
              its gap was whatever margin it had — 48px against the 143 the
              distribution was giving everything else. It takes the same tail
              as the pages for the same reason they do. */}
          <div className="pr-18">
            <Link
              href="/"
              aria-label="Homepage"
              className="font-medium text-on-surface hover:text-oxley-300"
            >
              {site.name}
            </Link>
          </div>

          <FolderGroup label="Projects" items={projects} />
          <FolderGroup label="Photography" items={photography} />
          <PageLink label="About" href="/about" column="pr-18" />
          <PageLink label="Running" href="/running" column="pr-18" />
          {/* Resume's tail only does work when the address follows it. Below
              `xl` it's the last thing in the row, so the tail would just hold
              the rhythm 72px short of the right edge. */}
          <PageLink
            label="Resume"
            href={resumeHref}
            column="pr-18 max-xl:pr-0"
          />
          <div className="max-xl:hidden">
            <ContactMail />
          </div>
        </nav>

        {/* Outside the nav rather than the last item in it, and that's the
            whole placement decision. `justify-between` hands its slack to
            every gap equally, so a 16px mark dropped into the row would have
            been pushed a hundred-odd pixels off the address and read as
            something that had come loose. Out here it takes a fixed margin and
            the address keeps the right edge of the text row, which is where
            the note above says the rhythm should put it.

            48px, not the 24 of the flex gap. The optical gap the eye reads is
            that plus the button's own 8px of padding, and at 32 the disc still
            looked like a suffix on the address rather than a separate thing —
            against optical gaps of roughly 120 everywhere else in the row, it
            has to be the loosest pair on the line before it reads as chrome
            sitting apart from the navigation.

            No pt of its own: the nav's own 6px plus the 20.8px line box centre
            the first row of type at 16.4px from the top, and a 32px button
            starting at 0 centres at 16. Within half a pixel, so the disc sits
            on the same optical line as the words beside it. */}
        <ThemeToggle className="ml-12" />
      </div>
    </header>
  );
}
