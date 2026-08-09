import { Footer } from "@/app/components/Footer";
import { TopNav } from "@/app/components/TopNav";

/**
 * Shell for the masthead-bearing pages (home + About / Running / Contact).
 * One column under a full-width nav. The Figma is drawn at 1440 (1376 of
 * content inside 32px gutters); the frame carries on to 1920 to match the
 * project and photography pages, so crossing from home into a case study
 * doesn't step the column width. Type keeps its own measure inside that —
 * only media takes the extra room. The full-bleed project pages live outside
 * this group and skip the nav.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      id="top"
      className="mx-auto flex min-h-screen w-full max-w-[1920px] flex-col gap-14 px-4 py-4 sm:px-8 lg:gap-24"
    >
      <TopNav />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
