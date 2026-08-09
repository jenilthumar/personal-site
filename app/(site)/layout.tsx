import { TopNav } from "@/app/components/TopNav";

/**
 * Shell for the masthead-bearing pages (home + About / Running / Contact).
 * One column under a full-width nav: 1376px of content inside a 1440px frame,
 * exactly the Figma, with the gutters shrinking on narrow screens. The
 * full-bleed project pages live outside this group and skip the nav.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-14 px-4 py-4 sm:px-8 lg:gap-24">
      <TopNav />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
