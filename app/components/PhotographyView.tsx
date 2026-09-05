import type { WorkItem } from "@/lib/content";
import { countPhotos } from "@/lib/content";
import { TopNav } from "./TopNav";
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
      {/* Outside the (site) layout, so this page draws the masthead itself, on
          the shell's own gutters — see the note in ProjectView. */}
      <div className="px-4 pt-4 sm:px-8">
        <TopNav />
      </div>

      <header className="px-6 pt-14">
        {/* The title block reveals; the wordmark above it doesn't — it's the
            page's chrome, and chrome holds still while content arrives. */}
        <div className="reveal mt-16 mb-16 flex max-w-[640px] flex-col gap-4 sm:mb-20">
          <div className="flex items-baseline gap-2">
            <h1 className="font-display text-[32px] leading-[1.3] font-medium tracking-[-0.01em] text-on-surface">
              {item.title}
            </h1>
            {count ? (
              <p className="font-mono text-base leading-[1.3] text-oxley-700">
                [{count}]
              </p>
            ) : null}
          </div>
          {description && (
            <p className="text-base leading-[1.3] text-body">{description}</p>
          )}
        </div>
      </header>

      {item.url && (
        <div className="reveal mb-16 sm:mb-20">
          <FilmSpotlight
            url={item.url}
            note={item.filmNote}
            title={item.title}
          />
        </div>
      )}

      <PhotoGallery photos={item.photos} title={item.title} />

      {next && (
        <div className="reveal px-6 pt-24 pb-24">
          <NextWork item={next} />
        </div>
      )}
    </div>
  );
}
