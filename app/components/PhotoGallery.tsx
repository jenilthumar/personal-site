import type { CSSProperties } from "react";
import Image from "next/image";
import { mediaUrl } from "@/lib/media";
import type { Photo, PhotoBlock } from "@/lib/content";

/** "3/2" → 1.5, used to weight a photo's width within a justified row. */
function ratioValue(aspect?: string): number {
  if (!aspect) return 3 / 2;
  const [w, h] = aspect.split("/").map((n) => Number(n.trim()));
  return w > 0 && h > 0 ? w / h : 3 / 2;
}

/** "3/2" → "3 / 2" for the CSS aspect-ratio property. */
function cssRatio(aspect?: string): string {
  return aspect ? aspect.replace("/", " / ") : "3 / 2";
}

function PhotoFigure({
  photo,
  title,
  sizes,
  style,
}: {
  photo: Photo;
  title: string;
  sizes: string;
  style?: CSSProperties;
}) {
  return (
    <figure className="flex min-w-0 flex-col gap-2" style={style}>
      <div
        className="relative w-full overflow-hidden bg-oxley-700/10"
        style={{ aspectRatio: cssRatio(photo.aspect) }}
      >
        {photo.src ? (
          <Image
            src={mediaUrl(photo.src)}
            alt={photo.caption ?? title}
            fill
            sizes={sizes}
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-oxley-700/25 via-oxley-700/10 to-transparent" />
        )}
      </div>
      {photo.caption && (
        <figcaption className="text-base leading-[1.3] text-oxley-700">
          {photo.caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Curated photo flow. A single Photo spans the content width; a Photo[] becomes
 * a justified row — each photo's width is weighted by its aspect ratio so the
 * images share one row at equal height regardless of mixed ratios. Rows stack
 * to a single column on mobile.
 */
export function PhotoGallery({
  photos,
  title,
}: {
  photos?: PhotoBlock[];
  title: string;
}) {
  if (!photos?.length) return null;

  return (
    <div className="flex flex-col gap-16 px-6">
      {photos.map((block, index) =>
        Array.isArray(block) ? (
          <div key={index} className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {block.map((photo, i) => (
              <PhotoFigure
                key={i}
                photo={photo}
                title={title}
                sizes="(min-width: 640px) 50vw, 100vw"
                style={{ flexGrow: ratioValue(photo.aspect), flexShrink: 1, flexBasis: 0 }}
              />
            ))}
          </div>
        ) : (
          <PhotoFigure
            key={index}
            photo={block}
            title={title}
            sizes="(min-width: 1920px) 1872px, 100vw"
          />
        ),
      )}
    </div>
  );
}
