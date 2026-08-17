import type { WorkItem } from "@/lib/content";
import { countPhotos } from "@/lib/content";
import { Wordmark } from "./Wordmark";
import { PhotoGallery } from "./PhotoGallery";
import { FilmSpotlight } from "./FilmSpotlight";
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
  const count = countPhotos(item.photos);

  return (
    <div className="mx-auto max-w-[1920px]">
      <header className="px-6 pt-6">
        <Wordmark className="text-oxley-300" />
        <div className="mt-16 mb-16 flex max-w-[640px] flex-col gap-4 sm:mb-20">
          <div className="flex items-baseline gap-2">
            <h1 className="text-[32px] leading-[1.3] text-on-surface">
              {item.title}
            </h1>
            {count ? (
              <p className="font-mono text-base leading-[1.3] text-oxley-700">
                [{count}]
              </p>
            ) : null}
          </div>
          {description && (
            <p className="text-base leading-[1.3] text-on-surface">
              {description}
            </p>
          )}
        </div>
      </header>

      {item.url && (
        <div className="mb-16 sm:mb-20">
          <FilmSpotlight
            url={item.url}
            note={item.filmNote}
            title={item.title}
          />
        </div>
      )}

      <PhotoGallery photos={item.photos} title={item.title} />

      {next && (
        <div className="px-6 pt-24 pb-24">
          <NextWork item={next} />
        </div>
      )}
    </div>
  );
}
