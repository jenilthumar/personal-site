import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";
import type { StudySection, WorkItem } from "@/lib/content";
import { ProjectHero } from "./ProjectHero";
import { TopNav } from "./TopNav";
import { StudySummary } from "./StudySummary";
import { StudyRail, StudyContents } from "./StudyRail";
import { NextWork } from "./NextWork";
import { studyMdxComponents } from "./study-mdx";

/**
 * Study-format case study: the layout for product work, where what's being
 * argued is the reasoning and the screens are the evidence. The showcase in
 * ProjectView.tsx is the other half of the pair.
 *
 * The hero is the same hero. It's the frame the reader tapped on the home
 * feed, it's the page's LCP, and it carries the view-transition pairing that
 * morphs one into the other — none of which the format below it has any
 * quarrel with. The two formats diverge under the fold, which is also where a
 * reader finds out which one they're in.
 *
 * Below it, one row starting at the shell's own gutter: a 160px rail, 96px of
 * gap, then the column, capped at 1088. The gap is wider than the 64 the row
 * opened with because the rail is chrome and the column is the piece — 64 put
 * a six-word list close enough to the prose to read as a first column of it,
 * and at 96 the two are plainly different things. It also lands the column's
 * left edge 288px in, against 168 of margin on its right, which is as close to
 * balanced as a page with a rail down one side gets. The group used to be centred as a
 * whole, which put the rail 80px in from the window on a 1512 display and
 * lined it up with nothing — the masthead above it starts at 32 and so does
 * every other page on the site. Flush left it agrees with all of them, and the
 * column lands 44px right of the window's centre, which is closer to centred
 * than the old arrangement managed anyway.
 *
 * That column is the whole geometry — prose sits on a 620px measure inside it
 * and media runs its full width, and nothing goes wider than that. A block
 * that reclaimed the rail's column would paint over the rail, which is sticky
 * and therefore always beside the text; the note on <Figure> in study-mdx.tsx
 * has the rest of that argument.
 *
 * `data-study-body` is what the rail measures its progress against.
 */
export function StudyView({
  item,
  sections,
  next,
  Post,
}: {
  item: WorkItem;
  sections: StudySection[];
  next?: WorkItem;
  Post?: ComponentType<{ components?: MDXComponents }> | null;
}) {
  return (
    <div className="mx-auto max-w-[1920px]">
      {/* These pages sit outside the (site) layout, so they draw the masthead
          themselves. A project that names a `heroInk` has the bar laid over
          its cover by ProjectHero and the frame runs to the top edge; one that
          doesn't gets it here instead, on the surface, 16px from the top and
          56px above the work — the shell's own rhythm. The gutter is this
          shell's own, which is also the left edge the study rail
          below it starts from. */}
      {!item.heroInk && (
        <div className="px-4 pt-4 sm:px-8">
          <TopNav />
        </div>
      )}

      <div className={`flex flex-col gap-24 ${item.heroInk ? "" : "pt-14"}`}>
        <ProjectHero
          hero={item.hero}
          heroVideo={item.heroVideo}
          title={item.title}
          slug={item.slug}
          ink={item.heroInk}
        />

        <div className="flex gap-24 px-4 sm:px-8">
          {sections.length > 0 && <StudyRail sections={sections} />}

          <article
            data-study-body
            className="min-w-0 flex-1 [&>*:last-child]:mb-0 lg:max-w-[1088px]"
          >
            <StudySummary item={item} />
            {sections.length > 0 && <StudyContents sections={sections} />}
            {Post && <Post components={studyMdxComponents} />}
          </article>
        </div>

        {next && (
          <div className="reveal px-6 pb-24">
            <NextWork item={next} />
          </div>
        )}
      </div>
    </div>
  );
}
