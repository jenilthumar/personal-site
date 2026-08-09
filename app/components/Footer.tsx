import { site } from "@/lib/site";
import { ChevronMark } from "./PixelMarks";

/**
 * The site footer: address on the left, the off-site links in the middle,
 * place and year on the right, with a way back to the top under them.
 *
 * The email is the one thing set larger — 18px, the same step the feed's
 * project headers use, so the page still only has three type sizes. Everything
 * else sits at the base size in the muted token and lifts to white on hover,
 * which is how the rest of the site treats a link.
 *
 * Back to top is a plain anchor rather than a scripted button, so it works
 * before hydration and lands correctly with JavaScript off. The smooth scroll
 * is CSS in globals, gated on reduced motion.
 */
export function Footer() {
  const email = site.social.find((link) => link.href.startsWith("mailto:"));
  const elsewhere = site.social.filter((link) => !link.href.startsWith("mailto:"));
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-oxley-700/40 pt-12 pb-6 text-base leading-[1.3] lg:mt-32">
      <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
        <div className="flex flex-col gap-1.5">
          <p className="text-oxley-700">Get in touch</p>
          {email && (
            <a
              href={email.href}
              className="w-fit text-[18px] tracking-[-0.16px] text-on-surface transition-colors hover:text-oxley-300"
            >
              {email.href.replace("mailto:", "")}
            </a>
          )}
        </div>

        {elsewhere.length > 0 && (
          <nav
            aria-label="Elsewhere"
            className="flex flex-wrap gap-x-8 gap-y-2 text-oxley-700 sm:pt-6"
          >
            {elsewhere.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-oxley-300"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex flex-col gap-1.5 text-oxley-700 sm:items-end sm:pt-6">
          <p>{site.location}</p>
          <p>© {year}</p>
          {/* Hops in the same two pixel steps as the nav glyphs. */}
          <a
            href="#top"
            className="group/top mt-4 flex w-fit items-center gap-1.5 transition-colors hover:text-oxley-300"
          >
            Back to top
            <span className="inline-flex w-[10.5px] justify-center">
              <ChevronMark className="-rotate-90 transition-[translate] duration-150 ease-[steps(2,jump-start)] motion-safe:group-hover/top:-translate-y-0.5" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
