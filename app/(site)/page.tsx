import { getWorkFeed } from "@/lib/content";
import { ProjectFeed } from "@/app/components/ProjectFeed";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <div className="flex flex-col gap-14 lg:gap-24">
      {/* The opening statement is the page's heading. 64px from 1440 up, over
          the Figma's 1376px measure, which it keeps even where the frame runs
          on to 1920 — past that width the line just gets long rather than
          grand. The vw term is sized to land exactly on 64 at 1440 and scale
          down with the column below it.

          Leading and tracking are both open a step from the Figma's 1.05 /
          -2.4px: at this size the lines were closing up on each other, and
          display type carries the tighter track without the words running
          together. Tracking is in em so it grows with the type.
          InterVariable's optical size axis sits at its display end via
          font-optical-sizing. */}
      <h1 className="max-w-[1376px] py-2.5 text-[clamp(1.75rem,4.444vw,4rem)] font-medium leading-[1.1] tracking-[-0.05em] text-on-surface">
        {site.statement}
      </h1>

      <ProjectFeed projects={getWorkFeed()} />
    </div>
  );
}
