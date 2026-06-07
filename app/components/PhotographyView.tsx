import type { WorkItem } from "@/lib/content";
import { Wordmark } from "./Wordmark";
import { PhotoGallery } from "./PhotoGallery";
import { NextWork } from "./NextWork";

/** Photo set: a quiet title + description header, then a curated photo flow. */
export function PhotographyView({
  item,
  next,
}: {
  item: WorkItem;
  next?: WorkItem;
}) {
  const description = item.description ?? item.summary;

  return (
    <div className="mx-auto max-w-[1920px]">
      <header className="px-6 pt-6">
        <Wordmark className="text-oxley-300" />
        <div className="mt-16 mb-24 flex max-w-[640px] flex-col gap-4">
          <h1 className="text-[32px] leading-[1.3] text-on-surface">
            {item.title}
          </h1>
          {description && (
            <p className="text-base leading-[1.3] text-on-surface">
              {description}
            </p>
          )}
        </div>
      </header>

      <PhotoGallery photos={item.photos} title={item.title} />

      {next && (
        <div className="px-6 pt-24 pb-24">
          <NextWork item={next} />
        </div>
      )}
    </div>
  );
}
