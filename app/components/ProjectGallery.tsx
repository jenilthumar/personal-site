import Image from "next/image";
import { mediaUrl } from "@/lib/media";
import type { GalleryItem } from "@/lib/content";

function Frame({
  src,
  alt,
  aspect,
  sizes,
}: {
  src?: string;
  alt: string;
  aspect: string;
  sizes: string;
}) {
  return (
    <div className={`relative w-full overflow-hidden bg-oxley-700/10 ${aspect}`}>
      {src ? (
        <Image
          src={mediaUrl(src)}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-oxley-700/25 via-oxley-700/10 to-transparent" />
      )}
    </div>
  );
}

/**
 * Edge-to-edge showcase below the summary. Each gallery entry is either a
 * string (full-bleed 16:9 image) or an array (a row of side-by-side images,
 * stacked on mobile). Empty strings render on-brand placeholders.
 */
export function ProjectGallery({
  gallery,
  title,
}: {
  gallery?: GalleryItem[];
  title: string;
}) {
  if (!gallery?.length) return null;

  return (
    <div className="flex flex-col">
      {gallery.map((entry, index) =>
        Array.isArray(entry) ? (
          <div key={index} className="grid grid-cols-1 sm:grid-cols-2">
            {entry.map((src, i) => (
              <Frame
                key={i}
                src={src || undefined}
                alt={`${title} — showcase image`}
                aspect="aspect-[720/879]"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
            ))}
          </div>
        ) : (
          <Frame
            key={index}
            src={entry || undefined}
            alt={`${title} — showcase image`}
            aspect="aspect-[16/9]"
            sizes="(min-width: 1920px) 1920px, 100vw"
          />
        ),
      )}
    </div>
  );
}
