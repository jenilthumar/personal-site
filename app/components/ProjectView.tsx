import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";
import type { WorkItem } from "@/lib/content";
import { ProjectHero } from "./ProjectHero";
import { TopNav } from "./TopNav";
import { ProjectSummary } from "./ProjectSummary";
import { NextWork } from "./NextWork";
import { projectMdxComponents } from "./project-mdx";

/**
 * Project case study: hero + summary, then the MDX body (text blocks + full-bleed
 * image rows, ordered by the editor), then the next-work card. Sections are
 * spaced 96px apart; the body's own first/last margins are reset so that gap
 * isn't doubled.
 */
export function ProjectView({
  item,
  next,
  Post,
}: {
  item: WorkItem;
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

        <div className="px-6">
          <ProjectSummary item={item} />
        </div>

        {Post && (
          <div className="min-w-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <Post components={projectMdxComponents} />
          </div>
        )}

        {next && (
          <div className="reveal px-6 pb-24">
            <NextWork item={next} />
          </div>
        )}
      </div>
    </div>
  );
}
