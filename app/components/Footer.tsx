import { site } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";

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
 * No top margin: the layout already spaces its children, so the rule sits the
 * same distance below the last row as the projects sit from each other.
 */
export function Footer() {
  const email = site.social.find((link) => link.href.startsWith("mailto:"));
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-oxley-700/40 pt-12 pb-6 text-sm leading-[1.4]">
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
          {/* Chrome, so it sits with the chrome. Bracketed to match the
              qualifiers the rest of the site labels things with. */}
          <ThemeToggle className="mt-2" />
        </div>
      </div>
    </footer>
  );
}
