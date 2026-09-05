import { Footer } from "@/app/components/Footer";
import { TopNav } from "@/app/components/TopNav";

/**
 * Shell for the masthead-bearing pages (home + About / Running / Contact).
 * One column under a full-width nav, running to 1920 inside 32px gutters — the
 * same frame the project and photography pages use, so crossing from home into
 * a case study doesn't step the column width.
 *
 * The Figma is drawn at 1440, which is 1376 of content inside those gutters,
 * and that 1376 is a measure rather than a frame: the statement stops there
 * because a line of type gets long rather than grand past it, and the case
 * study's reading column stops well short of it for the same reason. Media has
 * no such limit and takes the extra room — the work index fills the column at
 * every width, and the home page's line field escapes even this one.
 *
 * The cap was briefly 1440, to centre the page and put every element on the
 * same two edges. It did that, and it also shrank every cover on the site by
 * a quarter to buy an alignment that only shows up on a display wider than
 * most people have. The type measure was already doing the work of stopping
 * the page from sprawling; the pictures were never the problem.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1920px] flex-col gap-14 px-4 py-4 sm:px-8 lg:gap-24">
      <TopNav />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
