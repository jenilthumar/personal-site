import { ViewTransition } from "react";
import Image from "next/image";
import { IMAGE_QUALITY, mediaUrl } from "@/lib/media";
import { Wordmark } from "./Wordmark";
import { HeroVideo } from "./HeroVideo";

/**
 * Full-bleed 2.10:1 hero with the "Jenil HT®" mark overlaid top-left
 * (mix-blend-plus-lighter so it stays legible over any image). A looping
 * `heroVideo` takes over the frame when present (with `hero` as its poster);
 * otherwise the still hero image, falling back to a titled placeholder.
 *
 * The ratio follows the covers on home, which are cut to 2.10:1 and are the
 * same file — so the frame the reader tapped is the frame they land in, at the
 * same shape, and the morph between the two is a move rather than a reshape. A
 * `heroVideo` is still the 16:9 it was shot at and gets cropped top and bottom
 * to fit; it's a full-frame loop, so there's nothing at the edges to lose.
 */
export function ProjectHero({
  hero,
  heroVideo,
  title,
  slug,
}: {
  hero?: string;
  heroVideo?: string;
  title: string;
  /** Names the shared element the home feed morphs from. */
  slug: string;
}) {
  return (
    <header className="relative aspect-[21/10] w-full overflow-hidden bg-oxley-700/10">
      {heroVideo ? (
        <HeroVideo src={heroVideo} poster={hero} alt={title} />
      ) : hero ? (
        // The other end of the home feed's morph — a still only, since a
        // looping video has nothing to pair with.
        <ViewTransition name={`project-hero-${slug}`} share="morph">
          <Image
            src={mediaUrl(hero)}
            alt={title}
            fill
            // The page's LCP element, above the fold on every size — the one
            // case `preload` is still for. `priority` is deprecated in Next 16.
            preload
            sizes="(min-width: 1920px) 1920px, 100vw"
            quality={IMAGE_QUALITY}
            className="object-cover"
          />
        </ViewTransition>
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
