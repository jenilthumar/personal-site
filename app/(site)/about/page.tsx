import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { getWorkBySlug, workHref } from "@/lib/content";
import { mediaUrl, PHOTO_QUALITY } from "@/lib/media";
import { site } from "@/lib/site";
import { ChevronMark } from "@/app/components/PixelMarks";
import { ProseColumns } from "@/app/components/ProseColumns";
import { Statement } from "@/app/components/Statement";

export const metadata = {
  title: "About",
  description:
    "Jenil HT — a product and visual designer in Surat who designs the thing and builds the front of it too. Mountains, movies, and a slow but growing running habit.",
};

/**
 * The portrait under the opening statement. Not content, so it isn't in
 * `content/` — it's a page asset, but it's a photograph, so it lives on Blob
 * with the rest of the media rather than in `public/`.
 *
 * The design crops a 4:3 frame to a 1376 × 590 band, with the image pulled up
 * 341.14px: that puts the visible slice 77.25% of the way down the overflow,
 * which is where object-position gets its second value. Keeping it as a ratio
 * rather than a fixed height holds that crop as the column widens past 1440.
 * Below `sm` the band would be a 167px sliver, so the phone gets the whole
 * frame instead.
 */
const PORTRAIT = "about/portrait.webp";

/**
 * The photograph pulled in beside the mountains statement — a specific frame
 * from the trek, picked for this page rather than the set's cover.
 */
const TREK_PHOTO = {
  src: "work/pangarchulla/29.webp?v=2",
  alt: "Sunrise caught us mid-climb on Pangarchulla, over a sea of cloud",
  aspect: "2560/1441",
};

/**
 * A link in the running text. The design keeps it the same near-white as the
 * copy and marks it with an underline that follows the font's own metrics, so
 * hover is the only thing that lifts it — the site's 150ms in, 250ms out.
 */
function A({ href, children }: { href: string; children: ReactNode }) {
  const cls =
    "underline decoration-from-font [text-underline-position:from-font] transition-colors duration-250 ease-out-quart hover:text-oxley-300 hover:duration-150";
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  );
}

export default function AboutPage() {
  const trek = getWorkBySlug("pangarchulla");

  return (
    <div className="flex flex-col gap-14 lg:gap-24">
      <Statement as="h1" className="reveal">{`I'm Jenil. I design products and websites, and lately I build them too.`}</Statement>

      <div className="reveal relative w-full overflow-hidden bg-oxley-700/10 aspect-[4/3] sm:aspect-[1376/590]">
        <Image
          src={mediaUrl(PORTRAIT)}
          alt="Me on the beach in Goa, watching the sun go down over the Arabian Sea"
          fill
          sizes="(min-width: 1920px) 1856px, 100vw"
          quality={PHOTO_QUALITY}
          // First image on the page and barely below the fold, so it gets an
          // eager high-priority fetch. `priority` is deprecated in Next 16.
          loading="eager"
          fetchPriority="high"
          className="object-cover object-[50%_77%]"
        />
      </div>

      <ProseColumns className="reveal">
        <p>
          {`I'm a product and visual designer based in Surat. I design the work and build the front of it too, with Claude Code along for the ride, which lands me somewhere around design engineer. My taste runs quiet and functional more than loud, and the part I'm working on now is making it look as good as it works.`}
        </p>
        <p>
          {`I design at `}
          <A href={site.current.url}>Roboto Studio</A>
          {`, a remote studio where I work mostly on product and web. `}
          <A href="/work/sitenote">Sitenote</A>
          {` was the project that talked me into trusting myself, and `}
          <A href="/work/opera-group">Opera Group</A>
          {` is the most recent. I'm pushing harder on brand lately, which I'm not good at yet. That's sort of the point.`}
        </p>
      </ProseColumns>

      <Statement className="reveal">{`The mountains have my whole heart. Last April, right before Roboto, I walked up to Pangarchulla in Uttarakhand and I'm still not over it. It was that good.`}</Statement>

      {trek && (
        // The trek photo can reveal whole — unlike the home covers it carries
        // no view-transition name, so nothing morphs into it.
        <section aria-labelledby="trek-title" className="reveal">
          {/* Header and photograph under one link, the way the home feed does
              it — the picture is the obvious thing to click, so it should be
              the thing that's clickable. */}
          <Link
            href={workHref(trek)}
            data-cuelume-hover="tick"
            className="group/project flex flex-col gap-6 transition-opacity duration-200 ease-out-quart active:opacity-90 active:duration-0"
          >
            <span className="flex items-center justify-between gap-6 text-[18px] leading-[1.2] tracking-[-0.16px]">
              <h2 id="trek-title" className="flex min-w-0 items-center gap-4">
                <span className="truncate font-medium text-on-surface">
                  {trek.title}
                </span>
                <span className="hidden shrink-0 font-mono text-base text-oxley-700 transition-colors group-hover/project:text-on-surface sm:inline">
                  [{trek.tags[0]}]
                </span>
              </h2>

              <span className="flex shrink-0 items-center gap-1 text-on-surface transition-colors group-hover/project:text-oxley-300">
                Explore
                <ChevronMark className="transition-[translate] duration-150 ease-[steps(2,jump-start)] motion-safe:group-hover/project:translate-x-0.5" />
              </span>
            </span>

            <div
              className="relative w-full overflow-hidden bg-oxley-700/10 aspect-[var(--photo-ratio)]"
              style={
                {
                  "--photo-ratio": TREK_PHOTO.aspect.replace("/", " / "),
                } as React.CSSProperties
              }
            >
              <Image
                src={mediaUrl(TREK_PHOTO.src)}
                alt={TREK_PHOTO.alt}
                fill
                sizes="(min-width: 1920px) 1856px, 100vw"
                quality={PHOTO_QUALITY}
                className="object-cover"
              />
            </div>
          </Link>
        </section>
      )}

      <ProseColumns className="reveal">
        <p>
          {`Closer to home I take whatever I can reach from Surat: Saputara and Salher, Mount Abu, Malshej and the waterfall at Kalu. I follow mountaineering a lot more than I'm able to do it, which mostly means documentaries and a list of treks in Nepal I keep promising myself.`}
        </p>
        <p>
          {`I run now too, which is new and slow and somehow the best part of my week. When I'm not on my feet I'm probably watching something, since Letterboxd is the one corner of the internet that feels like home. The rest is cricket, a strange amount of time spent reading about stocks, collecting whatever I can learn from wherever I find it, and the people I'd put before all of it.`}
        </p>
      </ProseColumns>
    </div>
  );
}
