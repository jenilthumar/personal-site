import Link from "next/link";
import { site } from "@/lib/site";
import { ChevronMark } from "@/app/components/PixelMarks";
import { ProseColumns } from "@/app/components/ProseColumns";
import { Statement } from "@/app/components/Statement";

export const metadata = {
  title: "Contact",
  description: "Get in touch with Jenil HT.",
};

/* ──────────────────────────────────────────────────────────────────────────
   Contact, on the same column and rhythm as the other pages in the shell. It
   was the last page still on the old prose layout: a 672px measure and a 24px
   heading, where everything else opens at 56px on the 1376 column.

   The copy is unchanged. The opening line moves into the statement slot the
   way About's does, since the nav already says Contact and repeating it as a
   heading spends the largest type on the site on one word.
   ────────────────────────────────────────────────────────────────────────── */

/** What a link shows: the address itself, without the parts nobody reads. */
function display(href: string): string {
  return href
    .replace(/^mailto:/, "")
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-14 lg:gap-24">
      <Statement as="h1" className="reveal">{`I'm always happy to talk about new work, collaborations, or just good design.`}</Statement>

      <ProseColumns className="reveal">
        <p>{`The fastest way to reach me is email.`}</p>
        <p>
          {`For project enquiries, a short note about what you're building and a rough timeline is all I need to get started.`}
        </p>
      </ProseColumns>

      {/* One row per address, on the hairlines the running table uses. The
          whole row is the target rather than the label alone, so the address
          on the right is as clickable as the name on the left. */}
      <ul className="flex flex-col border-y border-oxley-700/25 divide-y divide-oxley-700/25">
        {site.social.map((link) => {
          const external = !link.href.startsWith("mailto:");
          const row = (
            <>
              <span className="font-medium text-on-surface transition-colors group-hover/row:text-oxley-300">
                {link.label}
              </span>
              <span className="flex min-w-0 shrink items-center gap-2 text-oxley-700 transition-colors group-hover/row:text-on-surface">
                <span className="truncate">{display(link.href)}</span>
                <ChevronMark className="transition-[translate] duration-150 ease-[steps(2,jump-start)] motion-safe:group-hover/row:translate-x-0.5" />
              </span>
            </>
          );
          // Every row ticks under the pointer like any other destination. The
          // address is the exception on the click: it doesn't take you
          // anywhere, it opens a compose window, which is the one thing on this
          // site that counts as having done something.
          const cue = {
            "data-cuelume-hover": "tick",
            ...(external ? {} : { "data-cuelume-toggle": "success" }),
          };
          const cls =
            "group/row flex items-center justify-between gap-6 py-5 text-[18px] leading-[1.2] tracking-[-0.16px] transition-opacity duration-200 ease-out-quart active:opacity-90 active:duration-0";
          return (
            // Each row reveals on its own so the table deals itself out top
            // to bottom, hairlines riding along — the page is short enough
            // that the whole run is on screen and the stagger does the work.
            <li key={link.href} className="reveal">
              {external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...cue}
                  className={cls}
                >
                  {row}
                </a>
              ) : (
                <Link href={link.href} {...cue} className={cls}>
                  {row}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
