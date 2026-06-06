import Image from "next/image";
import { mediaUrl } from "@/lib/media";
import { Wordmark } from "./Wordmark";

/**
 * Full-bleed 16:9 hero with the "Jenil HT®" mark overlaid top-left
 * (mix-blend-plus-lighter so it stays legible over any image). Until a real
 * hero image is provided, it falls back to a titled placeholder.
 */
export function ProjectHero({ hero, title }: { hero?: string; title: string }) {
  return (
    <header className="relative aspect-[16/9] w-full overflow-hidden bg-oxley-700/10">
      {hero ? (
        <Image
          src={mediaUrl(hero)}
          alt={title}
          fill
          priority
          sizes="(min-width: 1920px) 1920px, 100vw"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-oxley-700/25 via-oxley-700/10 to-transparent">
          <span className="px-6 text-center text-5xl font-medium tracking-[-0.02em] text-oxley-300/60 sm:text-7xl">
            {title}
          </span>
        </div>
      )}

      <Wordmark className="absolute left-6 top-6 z-10 mix-blend-plus-lighter" />
    </header>
  );
}
