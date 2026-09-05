import { ViewTransition } from "react";
import Image from "next/image";
import { IMAGE_QUALITY, mediaUrl } from "@/lib/media";
import { HeroVideo } from "./HeroVideo";
import { TopNav } from "./TopNav";
import type { NavInk } from "./TopNavBar";

/**
 * Full-bleed 2.10:1 hero. A looping `heroVideo` takes over the frame when
 * present (with `hero` as its poster); otherwise the still hero image, falling
 * back to a titled placeholder.
 *
 * The masthead sits on the picture when the project says which ink it should
 * take, which is what keeps the page opening on the whole frame rather than on
 * a strip of background above one. Without `ink` the nav is drawn on the
 * surface above instead, by ProjectView — a cover that can't carry a bar
 * shouldn't have to.
 *
 * It replaced a lone "Jenil HT®" wordmark in this corner, white in
 * `mix-blend-difference` so it inverted whatever was behind it, and the bar
 * wore that blend for a while too. It's a good trick with one blind spot this
 * collection walks straight into: `difference` inverts, so a backdrop near mid
 * grey comes back as another mid grey, and Stoa's sunset landed the bar at
 * 2.4:1. No scrim rescues it either — darkening the backdrop drags the
 * inverted type down with it, so both sides move together. Naming the ink is
 * the boring answer and the only one that holds on every cover.
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
  ink,
}: {
  hero?: string;
  heroVideo?: string;
  title: string;
  /** Names the shared element the home feed morphs from. */
  slug: string;
  /** Set to lay the masthead over the frame in that ink. */
  ink?: NavInk;
}) {
  return (
    <header
      className={`relative aspect-[21/10] w-full overflow-hidden ${
        ink ? `hero-under-${ink}` : "bg-oxley-700/10"
      }`}
    >
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

      {/* The shell's gutters and top offset exactly, so the bar lands in the
          same place here as on every other page — and, on a study, on the same
          left edge as the rail below it. Above the picture by DOM order and
          z-index both. */}
      {ink && (
        <div className="absolute inset-x-0 top-0 z-10 px-4 pt-4 sm:px-8">
          <TopNav ink={ink} />
        </div>
      )}
    </header>
  );
}
