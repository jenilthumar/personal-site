import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";
import type { WorkItem } from "@/lib/content";
import { ProjectHero } from "./ProjectHero";
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
    <div className="mx-auto flex max-w-[1920px] flex-col gap-24">
      <ProjectHero
        hero={item.hero}
        heroVideo={item.heroVideo}
        title={item.title}
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
        <div className="px-6 pb-24">
          <NextWork item={next} />
        </div>
      )}
    </div>
  );
}
