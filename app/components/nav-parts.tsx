import Link from "next/link";
import { mediaUrl } from "@/lib/media";
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
 *
 * The two layouts have drifted apart on purpose. The wide bar is a row of
 * columns, so everything in it is one size and the indent under a folder does
 * the nesting. The sheet is a single column with nothing to its right, which
 * asks a different question — what is a destination and what is a heading —
 * and answers it with typeface rather than size. See `sheet` below.
 */

export type NavItem = { slug: string; title: string; href: string };

/**
 * Anything off this site — the résumé PDF is the only one — opens in its own
 * tab. Loaded in place a PDF takes the site's slot: what comes back is the
 * browser's own viewer, and leaving it means backing out through that. The
 * pages, which are pages, navigate normally.
 */
const offSite = (href: string) =>
  /^https?:\/\//.test(href) ? { target: "_blank", rel: "noreferrer" } : {};

/**
 * One tappable line in the mobile sheet.
 *
 * Full-width and 44px tall, which is the whole reason this isn't a bare
 * `<Link>`: the sheet's rows used to be 18px of type with 12px between them,
 * so the target was 22px in a 34px pitch and the misses landed on nothing.
 * Height comes from the row rather than from padding on the text so the type
 * still sits on an even rhythm, and the flex makes the target span the sheet —
 * on a phone the fastest tap is the one that can't be aimed badly.
 *
 * Colour alone marks the current page. Re-weighting it would move the word,
 * which on a list this size is a visible reflow between one page and the next;
 * oxley-300 is the token this design already spends on emphasis.
 */
export function SheetRow({
  label,
  href,
  current,
}: {
  label: string;
  /** Omit or leave empty to render the row without making it tappable. */
  href?: string;
  /** The current pathname, so the row can mark itself. */
  current?: string;
}) {
  const row = "flex min-h-11 items-center font-medium";
  // Muted rather than styled like the rest: an item that looks exactly like
  // its neighbours but doesn't respond to a tap is worse than one that plainly
  // isn't ready yet. A span, so there's nothing to focus or activate.
  if (!href) return <span className={`${row} text-oxley-700`}>{label}</span>;

  const active = current === href;
  return (
    <Link
      href={href}
      {...offSite(href)}
      aria-current={active ? "page" : undefined}
      className={`${row} ${
        active ? "text-oxley-300" : "text-on-surface"
      } hover:text-oxley-300`}
    >
      {label}
    </Link>
  );
}

/**
 * A folder and the pages under it.
 *
 * In the wide bar the items are indented rather than sitting on the column
 * edge. They used to hang off where the folder's *name* started — past the
 * glyph and its gap — and before that at 2px, which put every child to the
 * left of its own parent and read as a second list that happened to follow the
 * first. With no glyph the measurement is arbitrary, so it's a plain step off
 * the spacing scale; what matters is that there is one, and that nesting is
 * the thing you see before you read anything.
 *
 * Which is also why folder and items share one weight there: with the indent
 * doing the work, dropping the items to regular would be a second signal
 * saying the same thing, and a weaker-looking list for it.
 */
export function FolderGroup({
  label,
  items,
  sheet = false,
  current,
}: {
  label: string;
  items: NavItem[];
  /**
   * The sheet inverts the bar's arrangement. There, heading and items are the
   * same size and an indent separates them; here the heading drops to the mono
   * label the site already uses for metadata — the footer's "Get in touch",
   * the bracketed counts — and the items take the sheet's one destination
   * size.
   *
   * That fixes the thing this panel actually got wrong. It used to set the
   * folders at 32px and the case studies beneath them at 18, so the pages you
   * open were the smallest type in a menu that exists to open them, and the
   * 1.8x step between the two was the only interval in the sheet. Now there is
   * one size for every place you can go and one label style for the words that
   * merely name a group, so nothing has to be measured against anything.
   *
   * The indent goes with it: with the heading in a different typeface the
   * nesting is already unmistakable, and a flush left edge means the folder
   * items and the standing pages finally share one.
   */
  sheet?: boolean;
  current?: string;
}) {
  if (!items.length) return null;
  return (
    <section className="flex flex-col gap-2">
      {sheet ? (
        // The count belongs inside the label rather than beside it. Set in the
        // same mono at the same size, `Projects [4]` is one string with one
        // space in it, and the pair can't fall out of alignment the way a
        // baseline-matched 16px span against a 32px heading did.
        <h2 className="font-mono text-base leading-[1.2] tracking-normal text-oxley-700">
          {label} [{items.length}]
        </h2>
      ) : (
        <h2 className="font-medium text-on-surface">{label}</h2>
      )}

      <ul
        role="list"
        className={sheet ? "flex flex-col" : "flex flex-col gap-1 pl-6"}
      >
        {items.map((item) => (
          <li key={item.slug}>
            {sheet ? (
              <SheetRow label={item.title} href={item.href} current={current} />
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-1 font-medium text-on-surface hover:text-oxley-300"
              >
                <BulletMark />
                {item.title}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * A standalone page in the wide bar.
 *
 * `column` widens the box without widening the link, which is the whole point
 * of the wrapper: the wide half is the column, the hover and hit area stay the
 * word. See the note on the desktop bar's spacing in TopNav.
 *
 * The sheet's equivalent is SheetRow, which is a different shape rather than a
 * variant of this one — it has a height to hit and a current-page state, and
 * neither means anything in a row of columns.
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
  const link = href ? (
    <Link
      href={href}
      {...offSite(href)}
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
 * The résumé's address, resolved once for both masthead layouts. A media path
 * in site config, a Blob URL by the time a link sees it. An empty setting stays
 * empty so PageLink can still render the item as text.
 */
export const resumeHref = site.resume ? mediaUrl(site.resume) : "";

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
