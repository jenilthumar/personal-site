import Image from "next/image";
import Link from "next/link";
import type { WorkItem } from "@/lib/content";
import { workHref } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { Tags } from "./Tags";

/**
 * A single work entry: a 16:9 cover (full-bleed image, or an on-brand
 * placeholder until a real cover is added) above a title / tags meta row.
 * The whole card links to the case study.
 */
export function WorkCard({
  item,
  priority = false,
}: {
  item: WorkItem;
  priority?: boolean;
}) {
  return (
    <Link href={workHref(item)} className="group block">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-oxley-700/10">
        {item.cover ? (
          <Image
            src={mediaUrl(item.cover)}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 40vw, (min-width: 640px) 48vw, 100vw"
            priority={priority}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-oxley-700/25 via-oxley-700/10 to-transparent">
            <span className="text-3xl font-medium text-oxley-700/70 transition-colors duration-500 group-hover:text-oxley-700">
              {item.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 text-base leading-[1.3]">
        <span className="min-w-0 flex-1 truncate text-on-surface transition-colors group-hover:text-oxley-300">
          {item.title}
        </span>
        <Tags tags={item.tags} className="shrink-0 justify-end whitespace-nowrap" />
      </div>
    </Link>
  );
}
