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
      <Statement as="h1">{`I'm always happy to talk about new work, collaborations, or just good design.`}</Statement>

      <ProseColumns>
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
          const cls =
            "group/row flex items-center justify-between gap-6 py-5 text-[18px] leading-[1.2] tracking-[-0.16px] transition-opacity duration-200 ease-out-quart active:opacity-90 active:duration-0";
          return (
            <li key={link.href}>
              {external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cls}
                >
                  {row}
                </a>
              ) : (
                <Link href={link.href} className={cls}>
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
