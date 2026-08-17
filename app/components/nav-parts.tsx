import Link from "next/link";
import { site } from "@/lib/site";
import { BulletMark } from "./PixelMarks";

/**
 * The pieces both masthead layouts draw with.
 *
 * They live apart from TopNav because the mobile sheet is a client component
 * and TopNav is not — it reads the content directory through `lib/content`,
 * which imports `node:fs` and so can never cross into the browser bundle.
 * Nothing in this file touches the filesystem, so both sides can import it.
 *
 * The nav used to lead every row with a raster pixel-art glyph. They're gone,
 * and a fair amount of machinery went with them: a per-glyph table of art
 * geometry, a `--glyph` size variable the boxes, gaps and indents all resolved
 * against, and a theme-flipped hover filter, because the artwork was drawn as
 * a pale-to-blue gradient against black and needed a different treatment on
 * white. What's left is type, which needs none of that.
 */

export type NavItem = { slug: string; title: string; href: string };

/**
 * A folder and the pages under it.
 *
 * The items are indented rather than sitting on the column edge. They used to
 * hang off where the folder's *name* started — past the glyph and its gap —
 * and before that at 2px, which put every child to the left of its own parent
 * and read as a second list that happened to follow the first. With no glyph
 * the measurement is arbitrary, so it's a plain step off the spacing scale;
 * what matters is that there is one, and that nesting is the thing you see
 * before you read anything.
 *
 * Which is also why folder and items share one weight: with the indent doing
 * the work, dropping the items to regular would be a second signal saying the
 * same thing, and a weaker-looking list for it.
 */
export function FolderGroup({
  label,
  items,
  sheet = false,
}: {
  label: string;
  items: NavItem[];
  /**
   * The mobile sheet sets its own size on the container and the headers
   * inherit it, so what changes here is the items — which have to step back
   * down, or a case study reads as loud as the section holding it — the
   * indent, which scales with them, and the count, which is worth having when
   * there's room for it.
   */
  sheet?: boolean;
}) {
  if (!items.length) return null;
  return (
    <section className={`flex flex-col ${sheet ? "gap-4" : "gap-2"}`}>
      <h2 className="flex items-baseline gap-3 font-medium text-on-surface">
        {label}
        {sheet && (
          <span className="font-mono text-base tracking-normal text-oxley-700">
            [{items.length}]
          </span>
        )}
      </h2>
      <ul
        role="list"
        className={`flex flex-col ${
          sheet
            ? "gap-3 pl-12 text-[18px] leading-[1.2] tracking-[-0.16px]"
            : "gap-1 pl-6"
        }`}
      >
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={item.href}
              className="flex items-center gap-1 font-medium text-on-surface hover:text-oxley-300"
            >
              <BulletMark />
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * A standalone page in the nav.
 *
 * `column` widens the box without widening the link, which is the whole point
 * of the wrapper: the wide half is the column, the hover and hit area stay the
 * word. See the note on the desktop bar's spacing in TopNav.
 */
export function PageLink({
  label,
  href,
  column = "",
}: {
  label: string;
  /** Omit or leave empty to render the item without making it clickable. */
  href?: string;
  column?: string;
}) {
  // Muted rather than styled like the rest: an item that looks exactly like
  // its neighbours but doesn't respond to a click is worse than one that
  // plainly isn't ready yet. A span, so there's nothing to focus or activate.
  const link = href ? (
    <Link
      href={href}
      className="w-fit font-medium text-on-surface hover:text-oxley-300"
    >
      {label}
    </Link>
  ) : (
    <span className="w-fit font-medium text-oxley-700">{label}</span>
  );
  return column ? <div className={column}>{link}</div> : link;
}

export const emailLink = site.social.find((link) =>
  link.href.startsWith("mailto:"),
);

/**
 * The address, not a button to a page about the address.
 *
 * This replaced a Contact link framed in corner ticks with a key chip beside
 * it. The ticks and the chip were the most decorated thing in a masthead that
 * is otherwise plain text, and all that ceremony bought you a second page to
 * read the address off. Now the address is the affordance and the tap opens a
 * compose window.
 */
export function ContactMail() {
  if (!emailLink) return null;
  return (
    <a
      href={emailLink.href}
      className="w-fit font-medium text-on-surface hover:text-oxley-300"
    >
      {emailLink.href.replace("mailto:", "")}
    </a>
  );
}
