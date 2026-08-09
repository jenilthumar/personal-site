import { getWorkFeed } from "@/lib/content";
import { ProjectFeed } from "@/app/components/ProjectFeed";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <div className="flex flex-col gap-14 lg:gap-24">
      {/* The opening statement is the page's heading. 56px at the full 1376px
          column, scaling down with it; the tracking is the design's -2.4px
          expressed in em so it holds at every size. InterVariable's optical
          size axis moves to its display end here via font-optical-sizing. */}
      <h1 className="py-2.5 text-[clamp(1.75rem,4.07vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.0429em] text-on-surface">
        {site.statement}
      </h1>

      <ProjectFeed projects={getWorkFeed()} />
    </div>
  );
}
