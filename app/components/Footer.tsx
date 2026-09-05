import { site } from "@/lib/site";

/**
 * The site footer, kept to two things: an address on the left, place and year
 * on the right.
 *
 * It runs a step below the rest of the page — 14px for the meta, 16px for the
 * email — since it's the one place that should read as small print. The email
 * stays the larger of the two so there's still somewhere for the eye to land,
 * and it keeps Inter for the same reason: everything around it is mono, so the
 * one line meant to be read rather than scanned is the one that isn't.
 *
 * No rule above it, and no top margin either. The layout already spaces its
 * children, so the footer sits the same distance below the last row as the
 * projects sit from each other — which is the separation, and a hairline on
 * top of it was drawing a line the spacing had already drawn. The 48px of
 * padding that used to hold the content off that rule stays: it's what keeps
 * the small print from reading as one more row of the page above it.
 */
export function Footer() {
  const email = site.social.find((link) => link.href.startsWith("mailto:"));
  const year = new Date().getFullYear();

  return (
    <footer className="pt-12 pb-6 text-sm leading-[1.4]">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-oxley-700">Get in touch</p>
          {email && (
            <a
              href={email.href}
              className="w-fit text-base tracking-[-0.01em] text-on-surface transition-colors hover:text-oxley-300"
            >
              {email.href.replace("mailto:", "")}
            </a>
          )}
        </div>

        <div className="flex flex-col gap-1 font-mono text-oxley-700 sm:items-end">
          <p>{site.location}</p>
          <p>© {year}</p>
        </div>
      </div>
    </footer>
  );
}
