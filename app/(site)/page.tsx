import { getWorkFeed } from "@/lib/content";
import { ProjectFeed } from "@/app/components/ProjectFeed";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <div className="flex flex-col gap-14 lg:gap-24">
      {/* The opening statement is the page's heading. 56px over the Figma's
          1376px measure, which it holds even where the frame runs on to 1920 —
          past that width the line just gets long rather than grand. Scales
          down with the column below 1440; the tracking is the design's -2.4px
          in em so it holds at every size. InterVariable's optical size axis
          moves to its display end here via font-optical-sizing. */}
      <h1 className="max-w-[1376px] py-2.5 text-[clamp(1.75rem,4.07vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.0429em] text-on-surface">
        {site.statement}
      </h1>

      <ProjectFeed projects={getWorkFeed()} />
    </div>
  );
}
