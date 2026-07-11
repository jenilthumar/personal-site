import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { IMAGE_QUALITY, mediaUrl } from "@/lib/media";
import { site } from "@/lib/site";

export const metadata = {
  title: "About",
  description:
    "Jenil HT — a product and visual designer in Surat who designs the thing and builds the front of it too. Mountains, movies, and a slow but growing running habit.",
};

/* A link styled like the site's prose anchors. Internal hrefs use next/link. */
function A({ href, children }: { href: string; children: ReactNode }) {
  const cls =
    "text-oxley-300 underline decoration-oxley-700 underline-offset-[3px] transition-colors hover:decoration-oxley-300";
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

/* The one flourish: a small photo woven into the running line (à la Anton). */
function Thumb({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="relative mx-[0.3em] inline-block size-[1.4em] translate-y-[0.04em] overflow-hidden align-[-0.32em] ring-1 ring-inset ring-white/10">
      <Image
        src={mediaUrl(src)}
        alt={alt}
        fill
        sizes="40px"
        quality={IMAGE_QUALITY}
        className="object-cover"
      />
    </span>
  );
}

/* The Roboto mark, same treatment as the sidebar, sized for the line. */
function Mark() {
  return (
    <span className="relative mx-[0.3em] inline-block size-[1.4em] translate-y-[0.04em] overflow-hidden bg-on-surface align-[-0.28em]">
      <Image
        src={mediaUrl(site.current.logo)}
        alt="Roboto Studio"
        fill
        sizes="24px"
        quality={IMAGE_QUALITY}
        className="object-cover [mix-blend-mode:plus-lighter]"
      />
    </span>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-oxley-700">
      {children}
    </h2>
  );
}

export default function AboutPage() {
  return (
    <div className="max-w-[40rem] pb-24">
      <h1 className="text-pretty text-[1.7rem] font-medium leading-[1.25] tracking-[-0.02em] text-oxley-300 sm:text-[2rem]">
        {`I'm Jenil. I design products and websites, and lately I build them too.`}
      </h1>

      <div className="mt-8 text-base leading-[1.8] text-on-surface">
        <p>
          {`I'm a product and visual designer based in Surat. I design the work and build the front of it too, with Claude Code along for the ride, which lands me somewhere around design engineer. My taste runs quiet and functional more than loud, and the part I'm working on now is making it look as good as it works.`}
        </p>
      </div>

      <details className="group mt-7">
        <summary className="inline-flex w-fit cursor-pointer list-none items-center gap-2 text-[0.95rem] leading-none text-oxley-700 transition-colors hover:text-oxley-300 [&::-webkit-details-marker]:hidden">
          <span
            aria-hidden="true"
            className="grid size-[18px] shrink-0 -translate-y-px place-items-center border border-current"
          >
            <svg
              viewBox="0 0 12 12"
              fill="none"
              className="size-[10px] transition-transform duration-200 ease-out-quart group-open:rotate-45"
            >
              <path
                d="M6 1.5v9M1.5 6h9"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="group-open:hidden">How I got here</span>
          <span className="hidden group-open:inline">Hide</span>
        </summary>
        <div className="mt-5 animate-rise-in space-y-5 text-base leading-[1.8] text-on-surface">
          <p>
            {`I grew up in Surat, with family roots in Amreli, a small town in Saurashtra where my father and grandfather were born, and so was I.`}
          </p>
          <p>
            {`I didn't plan on design. I grew up glued to computers and assumed I'd write software for a living, so I started a computer applications degree pointed straight at it. Programming never really took. Design did, and a lot faster. I'd been making YouTube thumbnails off my phone since school, mostly for one client, and he's the one who first said "UI/UX" to me. The idea that there was a kind of design sitting this close to tech was enough to make me download Figma that night. It clicked, and writing code quietly moved to the back of the room.`}
          </p>
          <p>
            {`It didn't stay there long. The computer-science half turned out to be the useful half, and now the two sit side by side.`}
          </p>
        </div>
      </details>

      <section className="mt-12">
        <Label>Work</Label>
        <div className="space-y-5 text-base leading-[1.8] text-on-surface">
          <p>
            {`I design at `}
            <A href={site.current.url}>Roboto Studio</A>
            <Mark />
            {`, a remote studio where I work mostly on product and web. `}
            <A href="/work/sitenote">Sitenote</A>
            <Thumb src="work/sitenote/sitenote-cover.webp" alt="Sitenote" />
            {` was the project that talked me into trusting myself, and `}
            <A href="/work/opera-group">Opera Group</A>
            <Thumb
              src="work/opera-group/01-hero-thumbnail.webp"
              alt="Opera Group"
            />
            {` is the most recent. I'm pushing harder on brand lately, which I'm not good at yet. That's sort of the point.`}
          </p>
        </div>
      </section>

      <section className="mt-12">
        <Label>Outside</Label>
        <div className="space-y-5 text-base leading-[1.8] text-on-surface">
          <p>
            {`The mountains have my whole heart. Last April, right before Roboto, I walked up to Pangarchulla in Uttarakhand and I'm still not over it. It was that good. Closer to home I take whatever I can reach from Surat: Saputara and Salher, Mount Abu, Malshej and the waterfall at Kalu. I follow mountaineering a lot more than I'm able to do it, which mostly means documentaries and a list of treks in Nepal I keep promising myself. Kilian Jornet is the closest thing I have to a hero.`}
          </p>
          <p>
            {`I run now too, which is new and slow and somehow the best part of my week. When I'm not on my feet I'm probably watching something, since Letterboxd is the one corner of the internet that feels like home. The rest is cricket, a strange amount of time spent reading about stocks, collecting whatever I can learn from wherever I find it, and the people I'd put before all of it.`}
          </p>
        </div>
      </section>

      <section className="mt-12">
        <Label>Say hi</Label>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-base text-on-surface">
          {site.social.map((link) => (
            <li key={link.href}>
              <A href={link.href}>{link.label}</A>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
