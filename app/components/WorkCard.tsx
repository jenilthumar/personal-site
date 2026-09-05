import Image from "next/image";
import Link from "next/link";
import type { WorkItem } from "@/lib/content";
import { workHref } from "@/lib/content";
import { IMAGE_QUALITY, mediaUrl, PHOTO_QUALITY } from "@/lib/media";
import { Tags } from "./Tags";

/**
 * A single work entry: a cover (full-bleed image, or an on-brand placeholder
 * until a real cover is added) above a title / tags meta row. The whole card
 * links to the case study.
 *
 * The frame follows the category, because the two kinds of cover are cut
 * differently. A project's is a composed 2.10:1 piece — the same file the home
 * grid and the case-study hero show — and a 16:9 box takes 15% off its sides,
 * which on a cover built around a wordmark cuts the word in half. Photography
 * covers are photographs at their own ratios, and 16:9 is already as much crop
 * as they should take.
 *
 * The ratio is written out rather than shared from a constant: Tailwind reads
 * class names as literal strings and can't follow one through a variable. Its
 * two other homes are WorkSection and ProjectHero.
 */
export function WorkCard({
  item,
  priority = false,
}: {
  item: WorkItem;
  priority?: boolean;
}) {
  return (
    <Link
      href={workHref(item)}
      className="group block transition-opacity duration-200 ease-out-quart active:opacity-90 active:duration-0"
    >
      <div
        className={`relative w-full overflow-hidden bg-oxley-700/10 ${
          item.category === "project" ? "aspect-[21/10]" : "aspect-[16/9]"
        }`}
      >
        {item.cover ? (
          <Image
            src={mediaUrl(item.cover)}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 40vw, (min-width: 640px) 48vw, 100vw"
            quality={item.category === "photography" ? PHOTO_QUALITY : IMAGE_QUALITY}
            priority={priority}
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out-quart motion-safe:group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-oxley-700/25 via-oxley-700/10 to-transparent">
            <span className="text-3xl font-medium text-oxley-700/70 transition-colors duration-500 group-hover:text-oxley-700">
              {item.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1 text-base leading-[1.3]">
        <div className="flex items-center justify-between gap-4">
          <span className="min-w-0 flex-1 truncate text-on-surface transition-colors group-hover:text-oxley-300">
            {item.title}
          </span>
          <Tags tags={item.tags} className="shrink-0 justify-end whitespace-nowrap" />
        </div>
        {/* The outcome line is parked here too, for the reason the home index
            parked it — see the note in WorkSection. The field is untouched;
            this card just doesn't print it. */}
      </div>
    </Link>
  );
}
