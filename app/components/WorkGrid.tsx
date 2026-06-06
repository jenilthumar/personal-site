import type { WorkItem } from "@/lib/content";
import { WorkCard } from "./WorkCard";

/**
 * Responsive 2-column grid of work cards (single column below `sm`).
 * Column gap 32px / row gap 40px match the Figma layout.
 */
export function WorkGrid({ items }: { items: WorkItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
      {items.map((item, index) => (
        <WorkCard key={item.slug} item={item} priority={index === 0} />
      ))}
    </div>
  );
}
