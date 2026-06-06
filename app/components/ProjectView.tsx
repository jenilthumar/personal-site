import type { WorkItem } from "@/lib/content";
import { ProjectHero } from "./ProjectHero";
import { ProjectSummary } from "./ProjectSummary";
import { ProjectGallery } from "./ProjectGallery";
import { NextWork } from "./NextWork";

/** Project case study: hero + summary (details grid) + showcase + next work. */
export function ProjectView({
  item,
  next,
}: {
  item: WorkItem;
  next?: WorkItem;
}) {
  return (
    <div className="mx-auto max-w-[1920px]">
      <ProjectHero hero={item.hero} title={item.title} />

      <div className="px-6 pt-24 pb-24">
        <ProjectSummary item={item} />
      </div>

      <ProjectGallery gallery={item.gallery} title={item.title} />

      {next && (
        <div className="px-6 pt-24 pb-24">
          <NextWork item={next} />
        </div>
      )}
    </div>
  );
}
