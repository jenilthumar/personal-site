import Image from "next/image";
import { IMAGE_QUALITY, mediaUrl } from "@/lib/media";
import { Wordmark } from "./Wordmark";
import { HeroVideo } from "./HeroVideo";

/**
 * Full-bleed 16:9 hero with the "Jenil HT®" mark overlaid top-left
 * (mix-blend-plus-lighter so it stays legible over any image). A looping
 * `heroVideo` takes over the frame when present (with `hero` as its poster);
 * otherwise the still hero image, falling back to a titled placeholder.
 */
export function ProjectHero({
  hero,
  heroVideo,
  title,
}: {
  hero?: string;
  heroVideo?: string;
  title: string;
}) {
  return (
    <header className="relative aspect-[16/9] w-full overflow-hidden bg-oxley-700/10">
      {heroVideo ? (
        <HeroVideo src={heroVideo} poster={hero} alt={title} />
      ) : hero ? (
        <Image
          src={mediaUrl(hero)}
          alt={title}
          fill
          priority
          sizes="(min-width: 1920px) 1920px, 100vw"
          quality={IMAGE_QUALITY}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-oxley-700/25 via-oxley-700/10 to-transparent">
          <span className="px-6 text-center text-5xl font-medium tracking-[-0.02em] text-oxley-300/60 sm:text-7xl">
            {title}
          </span>
        </div>
      )}

      {/* White text in mix-blend-difference → reads dark over light heroes and
          light over dark ones, adapting to any image (the mariotestino.com trick). */}
      <Wordmark className="absolute left-6 top-6 z-10 text-white mix-blend-difference" />
    </header>
  );
}
