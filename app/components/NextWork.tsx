import type { WorkItem } from "@/lib/content";
import { WorkCard } from "./WorkCard";

/**
 * "Next Work" footer — a label beside the next entry's card (reusing the home
 * WorkCard). The next entry is computed in display order by the page.
 */
export function NextWork({ item }: { item: WorkItem }) {
  return (
    <section className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
      <p className="text-[32px] leading-[1.3] text-on-surface">Next Work</p>
      <div className="w-full sm:max-w-[464px]">
        <WorkCard item={item} />
      </div>
    </section>
  );
}
